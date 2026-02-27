export const SESSION_COOKIE = "11-8-session";

export async function makeSessionToken(password: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? "fallback-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(password));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function validateSessionToken(token: string): Promise<boolean> {
  const password = process.env.APP_PASSWORD;
  if (!password) return false;
  const expected = await makeSessionToken(password);
  return token === expected;
}
