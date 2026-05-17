"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Save, Trash2, Plus, Menu, RefreshCw, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { generateId } from "@/lib/uuid";
import { DEFAULT_CVSS_VECTOR } from "@/lib/cvss";
import { debounce, isEqual } from "lodash";
import { cn } from "@/lib/utils";
import { VulnerabilityEditor } from "./vulnerability-editor";
import dynamic from "next/dynamic";
import { ClientSelector } from "./client-selector";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/ui/status-badge";
import { Scorecard } from "./scorecard";

const PDFPreview = dynamic(
  () => import("./pdf-preview").then((mod) => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-150 items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading PDF Engine...</p>
        </div>
      </div>
    ),
  },
);

const SortableFindingItem = ({
  vuln,
  selected,
  onClick,
}: {
  vuln: any;
  selected: boolean;
  onClick: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: vuln.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 border-b",
        selected ? "bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-4 text-muted-foreground"
      >
        <Menu className="size-4" />
      </div>
      <button
        onClick={onClick}
        className="flex-1 flex items-center justify-between p-4 pl-0 text-left"
      >
        <div className="space-y-1 overflow-hidden">
          <p className="text-sm font-medium leading-none truncate">
            {vuln.synopsis}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {vuln.severity} ({vuln.cvss_score?.toFixed(1) || 0})
          </p>
        </div>
      </button>
    </div>
  );
};
import { z } from "zod";

const targetSchema = z.object({
  id: z.string(),
  host: z.string().url("Must be a valid URL"),
  ip: z.string().ipv4("Must be a valid IPv4 address"),
  port: z.preprocess((val) => Number(val), z.number().min(1).max(65535)),
});

const reportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  client_id: z.string().min(1, "Client is required"),
  executive_summary: z.string().max(10000, "Summary must be 10000 characters or less").optional(),
  targets: z.array(targetSchema).min(1, "At least one target is required"),
});

export function ReportEditor({ initialData }: { initialData: any }) {
  const [report, setReport] = useState({
    ...initialData,
    title: initialData.title || "Untitled Report",
    client_id: initialData.client_id || "",
    targets: initialData.targets || [],
    vulnerabilities: initialData.vulnerabilities || [],
  });

  const [errors, setErrors] = useState<z.ZodFormattedError<any> | null>(null);

  useEffect(() => {
    const result = reportSchema.safeParse({
      title: report.title,
      client_id: report.client_id,
      executive_summary: report.executive_summary,
      targets: report.targets,
    });
    setErrors(result.success ? null : result.error.format());
  }, [report.title, report.client_id, report.executive_summary, report.targets]);

  const isFormValid = errors === null;

  const [originalReport, setOriginalReport] = useState(report);
  const isDirty = !isEqual(report, originalReport);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedVulnId, setSelectedVulnId] = useState<string | null>(
    initialData.vulnerabilities?.length > 0
      ? initialData.vulnerabilities[0].id
      : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    supabase
      .from("clients")
      .select("*")
      .then(({ data }) => setClients(data || []));
  }, [supabase]);

  const selectedVuln = report.vulnerabilities.find(
    (v: any) => v.id === selectedVulnId,
  );

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("drafts").upsert({
      report_id: report.id,
      user_id: user?.id,
      data: report,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to save draft: " + error.message);
    } else {
      toast.success("Draft saved to cloud");
      setOriginalReport(report);
    }
    setIsSaving(false);
  };

  const handleUpdateReport = (field: string, value: any) => {
    const updated = { ...report, [field]: value };
    setReport(updated);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = report.vulnerabilities.findIndex(
        (v: any) => v.id === active.id,
      );
      const newIndex = report.vulnerabilities.findIndex(
        (v: any) => v.id === over.id,
      );
      const newVulns = arrayMove(report.vulnerabilities, oldIndex, newIndex);
      handleUpdateReport(
        "vulnerabilities",
        newVulns.map((v: any, i: number) => ({ ...v, order_index: i })),
      );
    }
  };

  const handleUpdateVulnerability = (updatedVuln: any) => {
    const updatedVulns = report.vulnerabilities.map((v: any) =>
      v.id === updatedVuln.id ? updatedVuln : v,
    );
    setReport({ ...report, vulnerabilities: updatedVulns });
  };

  const handleAddTarget = () => {
    handleUpdateReport("targets", [
      ...(report.targets || []),
      { id: generateId(), host: "", ip: "", port: "" },
    ]);
  };

  const handleUpdateTarget = (id: string, field: string, value: string) => {
    const newTargets = report.targets.map((t: any) =>
      t.id === id ? { ...t, [field]: value } : t,
    );
    handleUpdateReport("targets", newTargets);
  };

  const handleHostChange = (id: string, host: string) => {
    const newTargets = report.targets.map((t: any) =>
      t.id === id ? { ...t, host } : t,
    );
    setReport((prev: any) => ({ ...prev, targets: newTargets }));
    debouncedLookup(id, host);
  };

  const handleLookupIp = async (id: string, host: string) => {
    try {
      if (!host) return;
      const hostname = new URL(
        host.startsWith("http") ? host : `https://${host}`,
      ).hostname;
      const response = await fetch(
        `https://dns.google/resolve?name=${hostname}`,
      );
      const data = await response.json();

      if (data.Answer) {
        const ip = data.Answer.find((a: any) => a.type === 1)?.data;
        if (ip) {
          setReport((prev: any) => {
            const updatedTargets = (prev.targets || []).map((t: any) =>
              t.id === id ? { ...t, ip } : t,
            );
            return { ...prev, targets: updatedTargets };
          });
        }
      }
    } catch (e) {
      // Silently fail on invalid input
    }
  };

  const debouncedLookup = useCallback(
    debounce((id: string, host: string) => handleLookupIp(id, host), 1000),
    [],
  );

  const saveDraft = (updatedReport: any) => {
    supabase
      .from("drafts")
      .upsert({
        report_id: updatedReport.id,
        user_id: report.user_id,
        data: updatedReport,
        updated_at: new Date().toISOString(),
      })
      .then(() => {});
  };

  const handleDeleteTarget = (id: string) => {
    handleUpdateReport(
      "targets",
      report.targets.filter((t: any) => t.id !== id),
    );
  };

  const handleAddVulnerability = async () => {
    const newVuln = {
      id: generateId(),
      report_id: report.id,
      synopsis: "New Finding",
      description: "",
      impact: "",
      mitigation: "",
      cvss_vector: DEFAULT_CVSS_VECTOR,
      cvss_score: 0,
      severity: "None",
      order_index: report.vulnerabilities.length,
    };

    const updatedVulns = [...report.vulnerabilities, newVuln];
    setReport({
      ...report,
      vulnerabilities: updatedVulns,
    });
    setSelectedVulnId(newVuln.id);
  };

  const handlePublish = async () => {
    setIsSaving(true);

    // 1. Process images
    const updatedVulnerabilities = await Promise.all(
      report.vulnerabilities.map(async (v: any) => {
        const urls = Array.isArray(v.screenshot_url)
          ? v.screenshot_url
          : [v.screenshot_url].filter(Boolean);
        const updatedUrls = await Promise.all(
          urls.map(async (url: string) => {
            if (typeof url === "string" && url.startsWith("blob:")) {
              const response = await fetch(url);
              const blob = await response.blob();
              const file = new File(
                [blob],
                `evidence-${v.id}-${generateId()}.webp`,
                { type: "image/webp" },
              );
              const formData = new FormData();
              formData.append("file", file);
              formData.append(
                "path",
                `findings/${report.id}/${v.id}/${file.name}`,
              );
              const result = await uploadEvidenceAction(formData);
              if (result.error) throw new Error(result.error);
              return result.data.url;
            }
            return url;
          }),
        );
        return { ...v, screenshot_url: updatedUrls };
      }),
    );

    // 2. Update/Insert Report
    const { error: reportError } = await supabase.from("reports").upsert({
      id: report.id,
      user_id: report.user_id,
      title: report.title,
      client_id: report.client_id,
      executive_summary: report.executive_summary || "",
      targets: report.targets || [],
      status: "published",
    });

    if (reportError) {
      toast.error("Failed to publish report: " + reportError.message);
      setIsSaving(false);
      return;
    }

    // 3. Persist Vulnerabilities
    const { error: vulnError } = await supabase.from("vulnerabilities").upsert(
      updatedVulnerabilities.map((v: any) => ({
        ...v,
        report_id: report.id,
      })),
    );

    if (vulnError) {
      toast.error("Failed to save findings: " + vulnError.message);
    } else {
      await supabase.from("drafts").delete().eq("report_id", report.id);
      toast.success("Report published!");
      setReport({ ...report, status: "published" });
      setOriginalReport({ ...report, status: "published" });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("reports")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", report.id);
    if (error) toast.error("Failed to delete");
    else window.location.href = "/dashboard";
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {report.title || "Untitled Report"}
            </h1>
            <StatusBadge
              variant={
                (report.status || "draft") === "published"
                  ? "published"
                  : "draft"
              }
            >
              {(report.status || "draft").toUpperCase()}
            </StatusBadge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Created: {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!isDirty}
          >
            <Save className="size-4 mr-2" /> Save Draft
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-4 mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the report to trash.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={!isFormValid}
              >
                <Save className="size-4 mr-2" /> Publish
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Publish Report?</AlertDialogTitle>
                <AlertDialogDescription>
                  Save this report? You can edit it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish}>
                  Publish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Scorecard vulnerabilities={report.vulnerabilities} />
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={report.title}
                    onChange={(e) =>
                      handleUpdateReport("title", e.target.value)
                    }
                    placeholder="e.g. Q1 Assessment"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <ClientSelector
                    value={report.client_id}
                    onChange={(v) => handleUpdateReport("client_id", v)}
                    clients={clients}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label>Executive Summary</Label>
                  <span
                    className={cn(
                      "text-xs",
                      (report.executive_summary?.length || 0) > 10000
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {report.executive_summary?.length || 0} / 10000
                  </span>
                </div>
                <Textarea
                  maxLength={10000}
                  value={report.executive_summary || ""}
                  onChange={(e) =>
                    handleUpdateReport("executive_summary", e.target.value)
                  }
                  placeholder="Summarize key findings and risk..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Targets</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddTarget}>
                <Plus className="size-4 mr-2" /> Add Target
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">Host (URL)</TableHead>
                    <TableHead className="w-2/5">IP Address</TableHead>
                    <TableHead className="w-1/5">Port</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.targets || []).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Input
                          required
                          value={t.host || ""}
                          onChange={(e) =>
                            handleHostChange(t.id, e.target.value)
                          }
                          placeholder="e.g., https://api.kira.com"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          disabled
                          required
                          value={t.ip || ""}
                          onChange={(e) =>
                            handleUpdateTarget(t.id, "ip", e.target.value)
                          }
                          placeholder="e.g., 10.0.0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          required
                          value={t.port || ""}
                          onChange={(e) =>
                            handleUpdateTarget(t.id, "port", e.target.value)
                          }
                          placeholder="e.g., 443"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTarget(t.id)}
                        >
                          <X className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <Card className="h-fit max-h-[calc(100vh-250px)] overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
                <CardTitle className="text-lg">Findings</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddVulnerability}
                >
                  <Plus className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={report.vulnerabilities.map((v: any) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {(report.vulnerabilities || []).length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No findings yet. Click + to add one.
                        </div>
                      ) : (
                        report.vulnerabilities.map((vuln: any) => (
                          <SortableFindingItem
                            key={vuln.id}
                            vuln={vuln}
                            selected={selectedVulnId === vuln.id}
                            onClick={() => setSelectedVulnId(vuln.id)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {selectedVuln ? (
                <VulnerabilityEditor
                  key={selectedVuln.id}
                  vulnerability={selectedVuln}
                  onUpdate={handleUpdateVulnerability}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Select a finding from the list to edit its details.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <PDFPreview data={report} status={report.status} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
