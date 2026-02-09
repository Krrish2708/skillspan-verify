import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { resumeId, resumeText } = await req.json();
    if (!resumeId || !resumeText) {
      return new Response(JSON.stringify({ error: "Missing resumeId or resumeText" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to parsing
    await supabase.from("resumes").update({ status: "parsing" }).eq("id", resumeId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert resume analyzer for an HR SaaS platform called VerifyHire. 
Your job is to extract and verify skill claims from resumes. For each skill found:
- Assess authenticity based on supporting evidence (projects, experience, certifications mentioned)
- Assign a score 0-100 based on evidence strength
- Categorize confidence as "verified" (strong evidence), "partially_verified" (some evidence), or "unverified" (no evidence)
- Provide brief evidence explanation

Also extract: candidate name, role/title, and generate an overall trust score.
Be thorough but fair. Look for inconsistencies like skills claimed without project evidence.`,
          },
          {
            role: "user",
            content: `Analyze this resume text and extract structured verification data:\n\n${resumeText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_resume_analysis",
              description: "Submit the structured resume analysis results",
              parameters: {
                type: "object",
                properties: {
                  candidate_name: { type: "string", description: "Full name of the candidate" },
                  candidate_role: { type: "string", description: "Primary job title/role" },
                  overall_score: { type: "integer", description: "Overall trust score 0-100" },
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill_name: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["programming", "framework", "database", "cloud", "devops", "soft_skill", "design", "general"],
                        },
                        score: { type: "integer", description: "Authenticity score 0-100" },
                        confidence: {
                          type: "string",
                          enum: ["verified", "partially_verified", "unverified"],
                        },
                        evidence: { type: "string", description: "Brief evidence explanation" },
                      },
                      required: ["skill_name", "category", "score", "confidence", "evidence"],
                      additionalProperties: false,
                    },
                  },
                  risk_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of risk flags or inconsistencies found",
                  },
                  experience_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        role: { type: "string" },
                        duration: { type: "string" },
                        verified: { type: "boolean" },
                      },
                      required: ["company", "role", "duration", "verified"],
                      additionalProperties: false,
                    },
                  },
                  certifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        issuer: { type: "string" },
                        verified: { type: "boolean" },
                      },
                      required: ["name", "issuer", "verified"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["candidate_name", "candidate_role", "overall_score", "skills", "risk_flags", "experience_items", "certifications"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_resume_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error("AI did not return structured data");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Update resume with parsed data
    await supabase
      .from("resumes")
      .update({
        status: "completed",
        candidate_name: analysis.candidate_name,
        candidate_role: analysis.candidate_role,
        overall_score: analysis.overall_score,
        parsed_data: {
          risk_flags: analysis.risk_flags,
          experience_items: analysis.experience_items,
          certifications: analysis.certifications,
        },
      })
      .eq("id", resumeId);

    // Insert skills
    if (analysis.skills?.length > 0) {
      const skillRows = analysis.skills.map((s: any) => ({
        resume_id: resumeId,
        skill_name: s.skill_name,
        category: s.category,
        score: Math.max(0, Math.min(100, s.score)),
        confidence: s.confidence,
        evidence: s.evidence,
      }));

      await supabase.from("resume_skills").insert(skillRows);
    }

    return new Response(JSON.stringify({ success: true, resumeId, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
