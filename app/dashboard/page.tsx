import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Filter, MoreVertical, Pencil, Trash2, Eye, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { format } from "date-fns"
import { Container } from "@/components/ui/container"
import { Grid } from "@/components/ui/grid"
import AppLayout from "../app-layout"
import { ReportActions } from "@/components/report-actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: { user } },
    { data: reports, error: reportsError },
    { data: drafts, error: draftsError }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("reports")
      .select("*, clients(name)")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("drafts")
      .select("report_id, data, updated_at")
  ])

  if (!user) return redirect("/login")

  const publishedReports = reports || []
  const draftReports = (drafts || []).map((d: any) => ({
    id: d.report_id,
    ...d.data,
    status: 'draft',
    created_at: d.data.created_at
  }))

  return (
    <AppLayout>
      <Container size="2xl" className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link href="/reports/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Report
              </Button>
            </Link>
          </div>
        </div>
        
        <Grid cols={3} gap="lg">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedReports.length + draftReports.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedReports?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftReports?.length || 0}</div>
            </CardContent>
          </Card>
        </Grid>


        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Published Reports</h3>
          <Grid cols={3} gap="lg">
            {publishedReports.length === 0 ? (
              <p className="text-sm text-muted-foreground italic col-span-full">No published reports.</p>
            ) : (
              publishedReports.map((report: any) => (
                <Card key={report.id} className="group hover:border-primary/50 transition-all flex flex-col">
                  <Link href={`/reports/${report.id}`} className="flex-1 p-6 flex flex-col">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex items-center justify-between">
                        <StatusBadge variant="published">{report.status.toUpperCase()}</StatusBadge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <CardTitle className="mt-2 line-clamp-1 group-hover:text-primary transition-colors">{report.title}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        Client: {report.clients?.name || "Unspecified"}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                  <CardContent className="flex justify-end pt-0 pb-6 px-6">
                    <ReportActions reportId={report.id} isDraft={false} />
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Drafts</h3>
          <Grid cols={3} gap="lg">
            {draftReports.length === 0 ? (
              <p className="text-sm text-muted-foreground italic col-span-full">No drafts available.</p>
            ) : (
              draftReports.map((report: any) => (
                <Card key={report.id} className="group hover:border-primary/50 transition-all flex flex-col">
                  <Link href={`/reports/${report.id}`} className="flex-1 p-6 flex flex-col">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex items-center justify-between">
                        <StatusBadge variant="draft">{report.status.toUpperCase()}</StatusBadge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <CardTitle className="mt-2 line-clamp-1 group-hover:text-primary transition-colors">{report.title}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        Client: {report.client_name || "Unspecified"}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                  <CardContent className="flex justify-end pt-0 pb-6 px-6">
                    <ReportActions reportId={report.id} isDraft={true} />
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
        </section>
      </Container>
    </AppLayout>
  )
}
