import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createHmac, timingSafeEqual, createHash } from "node:crypto"

const COOKIE_NAME = "admin_session"
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!s) throw new Error("ADMIN_PASSWORD or ADMIN_SESSION_SECRET must be set")
  return s
}

export function createAdminSession(): string {
  const ts = Date.now().toString()
  const secret = getSecret()
  const sig = createHmac("sha256", secret).update(ts).digest("hex")
  return Buffer.from(`${ts}.${sig}`).toString("base64url")
}

export function verifyAdminSession(value: string): boolean {
  try {
    const raw = Buffer.from(value, "base64url").toString()
    if (Buffer.from(raw).toString("base64url") !== value) return false
    if (!/^\d{13}\.[a-f0-9]{64}$/.test(raw)) return false
    const [ts, sig] = raw.split(".")
    const t = Number(ts)
    if (!Number.isSafeInteger(t) || t > Date.now() || Date.now() - t >= MAX_AGE_MS) return false
    const secret = getSecret()
    const expected = createHmac("sha256", secret).update(ts).digest("hex")
    if (expected.length !== sig.length) return false
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))
  } catch {
    return false
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const c = await cookies()
  // secure: false при ALLOW_INSECURE_COOKIE=1 (для локального npm run start)
  const secure = process.env.ALLOW_INSECURE_COOKIE !== "1" && process.env.NODE_ENV === "production"
  c.set(COOKIE_NAME, createAdminSession(), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: MAX_AGE_MS / 1000,
    path: "/",
  })
}

export async function clearAdminSessionCookie(): Promise<void> {
  const c = await cookies()
  c.delete(COOKIE_NAME)
}

export async function checkAdminSession(): Promise<boolean> {
  const c = await cookies()
  const v = c.get(COOKIE_NAME)?.value
  return !!v && verifyAdminSession(v)
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME
  const p = process.env.ADMIN_PASSWORD
  if (!u || !p) return false
  const hash = (value: string) => createHash("sha256").update(value).digest()
  return timingSafeEqual(hash(username), hash(u)) && timingSafeEqual(hash(password), hash(p))
}

export async function requireAdminSession(): Promise<void> {
  if (!(await checkAdminSession())) redirect("/admin/login")
}
