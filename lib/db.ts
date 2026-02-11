import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

const caPath = path.join(process.cwd(), "certs", "regru-ca.pem");
const ca = fs.readFileSync(caPath);

/** Парсит DATABASE_URL — без connectionString, чтобы ssl не перезаписывался pg-connection-string. */
function parseDbUrl(url: string): { host: string; port: number; user: string; password: string; database: string } {
  const withoutProto = url.replace(/^postgres(?:ql)?:\/\//, "");
  const atIdx = withoutProto.lastIndexOf("@");
  if (atIdx < 0) throw new Error("DATABASE_URL: отсутствует @");
  const creds = withoutProto.slice(0, atIdx);
  const hostPortDb = withoutProto.slice(atIdx + 1);
  const colonIdx = creds.indexOf(":");
  const user = colonIdx >= 0 ? decodeURIComponent(creds.slice(0, colonIdx)) : "";
  const password = colonIdx >= 0 ? decodeURIComponent(creds.slice(colonIdx + 1)) : "";
  const slashIdx = hostPortDb.indexOf("/");
  if (slashIdx < 0) throw new Error("DATABASE_URL: отсутствует /database");
  const hostPort = hostPortDb.slice(0, slashIdx);
  const database = decodeURIComponent(hostPortDb.slice(slashIdx + 1).replace(/\?.*$/, ""));
  const lastColon = hostPort.lastIndexOf(":");
  const host = lastColon >= 0 ? hostPort.slice(0, lastColon) : hostPort;
  const port = lastColon >= 0 ? parseInt(hostPort.slice(lastColon + 1), 10) : 5432;
  return { host, port, user, password, database };
}

const cs = process.env.DATABASE_URL;
if (!cs) throw new Error("DATABASE_URL is not set");
const config = parseDbUrl(cs);

export const pool = new Pool({
  ...config,
  ssl: {
    ca,
    rejectUnauthorized: true,
    checkServerIdentity: () => undefined,
  },
});

console.log("[db] Postgres target host:", config.host);

export function getDb() {
  return pool;
}
