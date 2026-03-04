const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function authProxy(
  action: string,
  params: Record<string, unknown> = {},
  token: string
) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/clerk-auth-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ action, ...params }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  token: string
) {
  const { signedUrl } = await authProxy(
    "get-upload-url",
    { bucket, path },
    token
  );

  const res = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!res.ok) throw new Error("File upload failed");
}

export async function invokeEdgeFunction(
  fnName: string,
  body: Record<string, unknown>,
  token: string
) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Edge function failed");
  return data;
}
