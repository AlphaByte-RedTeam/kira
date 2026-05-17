import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Container } from "@/components/ui/container"
import AppLayout from "@/app/app-layout"
import { ClientManager } from "@/components/client-manager"

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  return (
    <AppLayout>
      <Container size="2xl" className="py-10">
        <ClientManager />
      </Container>
    </AppLayout>
  )
}
