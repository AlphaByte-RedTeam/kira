import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ReportEditor } from "@/components/report-editor"
import { Container } from "@/components/ui/container"
import AppLayout from "@/app/app-layout"

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id
  
  if (!id) return notFound()

  const supabase = await createClient()

  const [
    { data: { user } },
    { data: report }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("reports")
      .select("*, vulnerabilities(*)")
      .eq("id", id)
      .is("deleted_at", null)
      .single()
  ])

  if (!user) return redirect("/login")

  // If report not found (new draft), use template
  const reportData = report || {
    id,
    user_id: user.id,
    title: "",
    client_id: "",
    targets: [],
    vulnerabilities: [],
    executive_summary: "",
    created_at: new Date().toISOString()
  }

  // Security check: ensure the report belongs to the user
  if (reportData.user_id !== user.id) {
    return redirect("/dashboard?error=unauthorized")
  }

  return (
    <AppLayout>
      <Container size="2xl" className="py-6">
        <ReportEditor initialData={reportData} />
      </Container>
    </AppLayout>
  )
}
