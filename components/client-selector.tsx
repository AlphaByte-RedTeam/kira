"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ClientSelector({
  value,
  onChange,
  clients: initialClients,
}: {
  value: string;
  onChange: (val: string) => void;
  clients: any[];
}) {
  const [open, setOpen] = React.useState(false);
  const [showNewClient, setShowNewClient] = React.useState(false);
  const [newClientName, setNewClientName] = React.useState("");
  const [newClientWebsite, setNewClientWebsite] = React.useState("");
  const [clients, setClients] = React.useState(initialClients);
  const supabase = createClient();

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .is("deleted_at", null);
    if (data) setClients(data);
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: newClientName,
        website: newClientWebsite,
        user_id: user.id,
      })
      .select("id, name")
      .single();

    if (error) {
      toast.error("Failed to create client: " + error.message);
    } else {
      await fetchClients();
      onChange(data.id);
      setShowNewClient(false);
      setNewClientName("");
      setNewClientWebsite("");
      toast.success("Client created");
    }
  };

  const selectedClient = clients.find((c) => c.id === value);

  React.useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  return (
    <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate max-w-[calc(100%-20px)]">
              {selectedClient ? selectedClient.name : "Select client..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-75 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search client..." />
            <CommandList className="max-h-30 overflow-y-auto">
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => {
                      onChange(client.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{client.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-1">
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal text-sm"
                  onClick={() => {
                    setOpen(false);
                    setShowNewClient(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> New Client
                </Button>
              </DialogTrigger>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Create a new client profile.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label>Client Name</Label>
            <Input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Website (Optional)</Label>
            <Input
              value={newClientWebsite}
              onChange={(e) => setNewClientWebsite(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateClient}>Create Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
