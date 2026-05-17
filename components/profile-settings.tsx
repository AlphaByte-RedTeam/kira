"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { uploadEvidenceAction } from "@/app/actions/storage";
import { Image as ImageIcon, Loader2, Save, Camera } from "lucide-react";

export function ProfileSettings({
  user,
  profile,
}: {
  user: any;
  profile: any;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    avatar_url: profile?.avatar_url || "",
    business_logo_url: profile?.business_logo_url || "",
  });

  const [pendingFiles, setPendingFiles] = useState<{
    avatar?: File;
    logo?: File;
  }>({});
  const [previews, setPreviews] = useState({
    avatar: profile?.avatar_url || "",
    logo: profile?.business_logo_url || "",
  });

  const supabase = createClient();

  const handleSave = async () => {
    setIsSaving(true);
    let newAvatarUrl = formData.avatar_url;
    let newLogoUrl = formData.business_logo_url;

    try {
      if (pendingFiles.avatar) {
        const data = new FormData();
        data.append("file", pendingFiles.avatar);
        data.append("path", `${user.id}/avatars/${pendingFiles.avatar.name}`);
        const res = await uploadEvidenceAction(data);
        if (res.error) throw new Error(res.error);
        newAvatarUrl = res.data?.url;
      }

      if (pendingFiles.logo) {
        const data = new FormData();
        data.append("file", pendingFiles.logo);
        data.append("path", `${user.id}/branding/${pendingFiles.logo.name}`);
        const res = await uploadEvidenceAction(data);
        if (res.error) throw new Error(res.error);
        newLogoUrl = res.data?.url;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.full_name,
        avatar_url: newAvatarUrl,
        business_logo_url: newLogoUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setPendingFiles({});
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelection = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "logo",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File exceeds 1MB limit");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format must be PNG, JPEG, or WebP");
      return;
    }

    if (type === "logo") {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      try {
        await new Promise((resolve, reject) => {
          img.onload = () => {
            if (img.width < 200 || img.height < 200)
              reject("Logo min 200x200px");
            if (img.width > 2000 || img.height > 2000)
              reject("Logo max 2000x2000px");
            resolve(true);
          };
          img.onerror = () => reject("Invalid image file");
          img.src = objectUrl;
        });
      } catch (err: any) {
        toast.error(err);
        return;
      }
    }

    setPendingFiles((prev) => ({ ...prev, [type]: file }));
    setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="size-20 border-2 border-muted">
                <AvatarImage src={previews.avatar} />
                <AvatarFallback>
                  {formData.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
              >
                <Camera className="size-3" />
              </button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelection(e, "avatar")}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Email changes are managed via auth provider.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-32 rounded-lg border border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
              {previews.logo ? (
                <img
                  src={previews.logo}
                  alt="Logo"
                  className="size-full object-contain p-4"
                />
              ) : (
                <ImageIcon className="size-10 text-muted-foreground/30" />
              )}
            </div>
            <div className="space-y-2 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                Select Logo
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => handleImageSelection(e, "logo")}
              />
              <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside mt-2">
                <li>Minimum resolution: 200x200px</li>
                <li>Maximum resolution: 2000x2000px</li>
                <li>Maximum file size: 1MB</li>
                <li>Format: PNG, JPEG, or WebP</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
