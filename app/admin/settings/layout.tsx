import { requireAdminSession } from "@/lib/admin-auth"
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession()
  return children
}
