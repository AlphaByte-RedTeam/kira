import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/app/app-layout"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect("/login")

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  return (
    <AppLayout>
      <Container size="2xl" className="py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Reports</h1>
          <Link href="/reports/new"><Button><Plus className="size-4 mr-2"/> New Report</Button></Link>
        </div>
        
        {reports?.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No reports found.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {reports?.map(report => (
              <Card key={report.id}>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>{report.title}</CardTitle>
                  <Button variant="outline" asChild><Link href={`/reports/${report.id}`}>Open</Link></Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </AppLayout>
  )
}
