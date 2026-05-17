"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less"),
  website: z.string().max(1000, "Website must be 1000 characters or less").optional().or(z.literal(''))
})

export function ClientManager() {
  const [clients, setClients] = React.useState<any[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [editingClient, setEditingClient] = React.useState<any>(null)
  const [name, setName] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const supabase = createClient()

  const fetchClients = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("clients").select("*").is("deleted_at", null)
    setClients(data || [])
    setSelectedIds([])
    setIsLoading(false)
  }

  React.useEffect(() => { fetchClients() }, [])

  const handleSave = async () => {
    const result = clientSchema.safeParse({ name, website })
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingClient) {
      await supabase.from("clients").update({ name, website }).eq("id", editingClient.id)
    } else {
      await supabase.from("clients").insert({ name, website, user_id: user.id })
    }
    toast.success("Client saved")
    setEditingClient(null); setName(""); setWebsite(""); fetchClients()
  }

  const handleDeleteSelected = async () => {
    const { data: linkedReports, error: checkError } = await supabase
      .from("reports")
      .select("id, client_id")
      .in("client_id", selectedIds)
      .is("deleted_at", null)

    if (checkError) {
      toast.error("Failed to verify client dependencies")
      return
    }

    if (linkedReports && linkedReports.length > 0) {
      toast.error("Cannot delete client(s): some are linked to active reports")
      return
    }

    await supabase.from("clients").update({ deleted_at: new Date().toISOString() }).in("id", selectedIds)
    toast.success("Selected clients deleted")
    fetchClients()
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === clients.length && clients.length > 0) setSelectedIds([])
    else setSelectedIds(clients.map(c => c.id))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clients</h2>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="size-4 mr-2" /> Delete Selected ({selectedIds.length})</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Selected Clients?</AlertDialogTitle><AlertDialogDescription>This will move {selectedIds.length} clients to trash.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingClient(null); setName(""); setWebsite("") }}><Plus className="size-4 mr-2" /> Add Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingClient ? "Edit Client" : "New Client"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1"><Label>Name</Label><Input maxLength={255} value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Website</Label><Input maxLength={1000} value={website} onChange={e => setWebsite(e.target.value)} /></div>
              </div>
              <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><Checkbox checked={selectedIds.length === clients.length && clients.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map(c => (
            <TableRow key={c.id}>
              <TableCell><Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.website}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditingClient(c); setName(c.name); setWebsite(c.website || ""); }}><Pencil className="size-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
