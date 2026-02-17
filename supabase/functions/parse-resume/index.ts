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

    const { resumeId, resumeText, jobDescription, roleTitle, experienceRange } = await req.json();
    if (!resumeId || !resumeText) {
      return new Response(JSON.stringify({ error: "Missing resumeId or resumeText" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasJD = !!(jobDescription || roleTitle);

    await supabase.from("resumes").update({ status: "parsing" }).eq("id", resumeId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert resume analyzer for VerifyHire, an HR SaaS platform.

Analyze the resume comprehensively across these dimensions:

1. ATS SCORING (0-100):
- Formatting: proper sections, consistent formatting, parseable structure
- Keywords: technical skill density, action verbs, industry terms
- Structure: has contact info, clear sections (Education, Experience, Skills, Projects)
- List which standard sections are present and which are missing

2. SKILL EXTRACTION & VALIDATION:
For each skill found, calculate an authenticity score using these rules:
- Mentioned only in skills section → base score (30-50)
- Also mentioned in project descriptions → boost (+20-30)
- Also in experience bullet points → boost (+15-25)
- Supported by certification → boost (+10-15)
- Mentioned only once with no context → low confidence (10-30)
Categorize confidence as "verified", "partially_verified", or "unverified"

3. CREDIBILITY & EVIDENCE VALIDATION (0-100):
- Check if skills have supporting project mentions
- Check for GitHub/portfolio/certification links
- If GitHub link exists → increase credibility
- If certification mentioned without verification link → reduce credibility weight
- Count projects with vs without links
- Provide detailed reasoning per skill

4. EXPERIENCE TIMELINE:
- Check for gaps, overlaps, or inconsistencies
- Classify as "consistent", "minor_gaps", or "inconsistent"

5. EDUCATION & CERTIFICATIONS:
- Extract all education entries and certifications
- Mark certifications as verified (has link/ID) or unverified

6. LINKS:
- Extract all URLs (GitHub, LinkedIn, portfolio, certification URLs)

7. CANDIDATE FEEDBACK:
- Generate a professional strength summary
- List missing evidence items
- Provide actionable improvement suggestions

${hasJD ? `
8. JD RELEVANCE MATCHING (0-100):
- Compute semantic similarity between resume and job description
- Identify matched skills, missing skills, and keyword matches
- Role: ${roleTitle || "Not specified"}
- Experience: ${experienceRange || "Not specified"}` : ""}

SCORING FORMULA:
- ATS Score: Based on formatting + keywords + structure
- Credibility Score: Based on evidence quality
- Relevancy Score: Based on JD match (0 if no JD provided)
- Overall Score: Weighted combination`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this resume:\n\n${resumeText}${hasJD ? `\n\n--- JOB DESCRIPTION ---\n${jobDescription || ""}` : ""}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_resume_analysis",
              description: "Submit comprehensive resume analysis results",
              parameters: {
                type: "object",
                properties: {
                  candidate_name: { type: "string" },
                  candidate_role: { type: "string" },
                  overall_score: { type: "integer", description: "Overall weighted score 0-100" },
                  ats_score: { type: "integer", description: "ATS compatibility score 0-100" },
                  credibility_score: { type: "integer", description: "Evidence-based credibility score 0-100" },
                  relevancy_score: { type: "integer", description: "JD relevance score 0-100 (0 if no JD)" },
                  ats_breakdown: {
                    type: "object",
                    properties: {
                      formatting_score: { type: "integer" },
                      keyword_score: { type: "integer" },
                      structure_score: { type: "integer" },
                      contact_info_present: { type: "boolean" },
                      sections_detected: { type: "array", items: { type: "string" } },
                      missing_sections: { type: "array", items: { type: "string" } },
                    },
                    required: ["formatting_score", "keyword_score", "structure_score", "contact_info_present", "sections_detected", "missing_sections"],
                    additionalProperties: false,
                  },
                  credibility_breakdown: {
                    type: "object",
                    properties: {
                      evidence_score: { type: "integer" },
                      github_linked: { type: "boolean" },
                      certifications_verified: { type: "integer" },
                      certifications_unverified: { type: "integer" },
                      projects_with_links: { type: "integer" },
                      projects_without_links: { type: "integer" },
                    },
                    required: ["evidence_score", "github_linked", "certifications_verified", "certifications_unverified", "projects_with_links", "projects_without_links"],
                    additionalProperties: false,
                  },
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill_name: { type: "string" },
                        category: { type: "string", enum: ["programming", "framework", "database", "cloud", "devops", "soft_skill", "design", "general"] },
                        score: { type: "integer", description: "Authenticity score 0-100 using validation rules" },
                        confidence: { type: "string", enum: ["verified", "partially_verified", "unverified"] },
                        evidence: { type: "string" },
                      },
                      required: ["skill_name", "category", "score", "confidence", "evidence"],
                      additionalProperties: false,
                    },
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
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        institution: { type: "string" },
                        degree: { type: "string" },
                        year: { type: "string" },
                      },
                      required: ["institution", "degree", "year"],
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
                  links: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        url: { type: "string" },
                      },
                      required: ["type", "url"],
                      additionalProperties: false,
                    },
                  },
                  risk_flags: { type: "array", items: { type: "string" } },
                  matched_skills: { type: "array", items: { type: "string" } },
                  missing_skills: { type: "array", items: { type: "string" } },
                  matched_keywords: { type: "array", items: { type: "string" } },
                  timeline_consistency: { type: "string", enum: ["consistent", "minor_gaps", "inconsistent"] },
                  strength_summary: { type: "string", description: "Professional summary of resume strengths" },
                  missing_evidence: { type: "array", items: { type: "string" }, description: "List of claims lacking evidence" },
                  improvement_suggestions: { type: "array", items: { type: "string" }, description: "Actionable improvement tips" },
                },
                required: [
                  "candidate_name", "candidate_role", "overall_score", "ats_score",
                  "credibility_score", "relevancy_score", "ats_breakdown", "credibility_breakdown",
                  "skills", "experience_items", "education", "certifications", "links",
                  "risk_flags", "matched_skills", "missing_skills", "matched_keywords",
                  "timeline_consistency", "strength_summary", "missing_evidence", "improvement_suggestions"
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_resume_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429 || status === 402) {
        await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
        const msg = status === 429 ? "Rate limit exceeded. Please try again later." : "AI credits exhausted. Please add more credits.";
        return new Response(JSON.stringify({ error: msg }), {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error("AI did not return structured data");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Update resume with all scores and parsed data
    await supabase
      .from("resumes")
      .update({
        status: "completed",
        candidate_name: analysis.candidate_name,
        candidate_role: analysis.candidate_role,
        overall_score: analysis.overall_score,
        ats_score: analysis.ats_score,
        credibility_score: analysis.credibility_score,
        relevancy_score: analysis.relevancy_score || 0,
        job_description: jobDescription || null,
        role_title: roleTitle || null,
        experience_range: experienceRange || null,
        parsed_data: {
          risk_flags: analysis.risk_flags,
          experience_items: analysis.experience_items,
          certifications: analysis.certifications,
          education: analysis.education || [],
          links: analysis.links || [],
          ats_breakdown: analysis.ats_breakdown,
          credibility_breakdown: analysis.credibility_breakdown,
          relevancy_score: analysis.relevancy_score || 0,
          matched_skills: analysis.matched_skills || [],
          missing_skills: analysis.missing_skills || [],
          matched_keywords: analysis.matched_keywords || [],
          timeline_consistency: analysis.timeline_consistency,
          strength_summary: analysis.strength_summary,
          missing_evidence: analysis.missing_evidence || [],
          improvement_suggestions: analysis.improvement_suggestions || [],
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
