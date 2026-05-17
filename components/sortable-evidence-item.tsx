"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const SortableEvidenceItem = ({
  url,
  onRemove,
}: {
  url: string;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: url });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group size-24 rounded-lg overflow-hidden border"
    >
      <img src={url} alt="Evidence" className="size-full object-cover" />
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab opacity-0 group-hover:opacity-100 bg-black/20"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100"
        onClick={onRemove}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
};
