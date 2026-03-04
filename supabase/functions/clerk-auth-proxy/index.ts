import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify, decodeJwt } from "https://esm.sh/jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

async function verifyClerkToken(token: string): Promise<string> {
  const claims = decodeJwt(token);
  const issuer = claims.iss as string;
  if (!issuer) throw new Error("Invalid token: no issuer");

  if (!jwksCache.has(issuer)) {
    jwksCache.set(issuer, createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)));
  }

  const { payload } = await jwtVerify(token, jwksCache.get(issuer)!);
  if (!payload.sub) throw new Error("Invalid token: no sub claim");
  return payload.sub;
}

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return respond({ error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const userId = await verifyClerkToken(token);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "get-profile": {
        let { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("auth_id", userId)
          .maybeSingle();

        if (!profile) {
          const { data: newProfile, error } = await supabase
            .from("profiles")
            .insert({
              auth_id: userId,
              email: params.email || null,
              full_name: params.fullName || null,
            })
            .select("id, full_name, email")
            .single();
          if (error) throw error;
          profile = newProfile;
        }

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        return respond({
          profileId: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          role: roleData?.role || null,
        });
      }

      case "set-role": {
        const { role } = params;
        if (!["hr", "candidate"].includes(role)) return respond({ error: "Invalid role" }, 400);

        const { data: existing } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existing) return respond({ error: "Role already set" }, 400);

        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
        return respond({ success: true, role });
      }

      case "list-resumes": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", userId)
          .maybeSingle();
        if (!profile) return respond({ resumes: [] });

        const query = supabase
          .from("resumes")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false });

        if (params.status) query.eq("status", params.status);

        const { data, error } = await query;
        if (error) throw error;
        return respond({ resumes: data || [] });
      }

      case "get-resume-with-skills": {
        const { resumeId } = params;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", userId)
          .maybeSingle();

        const { data: resume, error: rErr } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", resumeId)
          .maybeSingle();

        if (rErr) throw rErr;
        if (!resume) return respond({ error: "Not found" }, 404);
        if (resume.profile_id !== profile?.id) return respond({ error: "Forbidden" }, 403);

        const { data: skills } = await supabase
          .from("resume_skills")
          .select("*")
          .eq("resume_id", resumeId)
          .order("score", { ascending: false });

        return respond({ resume, skills: skills || [] });
      }

      case "create-resume": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", userId)
          .maybeSingle();
        if (!profile) return respond({ error: "Profile not found" }, 400);

        const { data: resume, error } = await supabase
          .from("resumes")
          .insert({
            profile_id: profile.id,
            file_name: params.fileName,
            file_url: params.fileUrl || null,
            status: "pending",
          })
          .select("id")
          .single();
        if (error) throw error;
        return respond({ resumeId: resume.id });
      }

      case "get-upload-url": {
        const { bucket, path } = params;
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUploadUrl(path);
        if (error) throw error;
        return respond({
          signedUrl: data.signedUrl,
          token: data.token,
          path: data.path,
          fullPath: data.fullPath,
        });
      }

      case "list-completed-with-skills": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", userId)
          .maybeSingle();
        if (!profile) return respond({ resumes: [], skills: [] });

        const { data: resumes } = await supabase
          .from("resumes")
          .select("*")
          .eq("profile_id", profile.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (!resumes || resumes.length === 0) return respond({ resumes: [], skills: [] });

        const resumeIds = resumes.map((r: any) => r.id);
        const { data: skills } = await supabase
          .from("resume_skills")
          .select("*")
          .in("resume_id", resumeIds);

        return respond({ resumes, skills: skills || [] });
      }

      default:
        return respond({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    console.error("clerk-auth-proxy error:", e);
    return respond(
      { error: e instanceof Error ? e.message : "Internal error" },
      500
    );
  }
});
