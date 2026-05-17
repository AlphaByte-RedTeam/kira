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

export function ClientManager() {
  const [clients, setClients] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [editingClient, setEditingClient] = React.useState<any>(null)
  const [name, setName] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const supabase = createClient()

  const fetchClients = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("clients").select("*").is("deleted_at", null)
    setClients(data || [])
    setIsLoading(false)
  }

  React.useEffect(() => { fetchClients() }, [])

  const handleSave = async () => {
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

  const handleDelete = async (id: string) => {
    await supabase.from("clients").update({ deleted_at: new Date().toISOString() }).eq("id", id)
    toast.success("Client deleted")
    fetchClients()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingClient(null); setName(""); setWebsite("") }}><Plus className="size-4 mr-2" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingClient ? "Edit Client" : "New Client"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-1"><Label>Website</Label><Input value={website} onChange={e => setWebsite(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Website</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
        <TableBody>
          {clients.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.website}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditingClient(c); setName(c.name); setWebsite(c.website || ""); }}><Pencil className="size-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="size-4 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Client?</AlertDialogTitle><AlertDialogDescription>This client will be removed from your list.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(c.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
