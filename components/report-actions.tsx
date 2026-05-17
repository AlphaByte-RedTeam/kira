"use client";

import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ReportActions({
  reportId,
  isDraft,
}: {
  reportId: string;
  isDraft?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    const table = isDraft ? "drafts" : "reports";
    // For drafts, we remove the record. For published, we soft delete.
    const { error } = isDraft
      ? await supabase.from("drafts").delete().eq("report_id", reportId)
      : await supabase
          .from("reports")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", reportId);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted successfully");
      router.refresh();
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/reports/${reportId}`}>
              <Pencil className="size-4 mr-2" /> Edit
            </Link>
          </DropdownMenuItem>
          {!isDraft && (
            <DropdownMenuItem>
              <Eye className="size-4 mr-2" /> Preview
            </DropdownMenuItem>
          )}
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="size-4 mr-2" /> Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
