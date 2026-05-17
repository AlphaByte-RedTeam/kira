"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { uploadEvidenceAction } from "@/app/actions/storage"
import { Image as ImageIcon, Loader2, Save, User, Camera } from "lucide-react"

export function ProfileSettings({ user, profile }: { user: any, profile: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    avatar_url: profile?.avatar_url || "",
    business_logo_url: profile?.business_logo_url || ""
  })
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      })

    if (error) {
      toast.error("Failed to update profile")
    } else {
      toast.success("Settings saved successfully")
    }
    setIsSaving(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Pre-upload validation: Check resolution using browser APIs
    if (type === 'logo') {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      const checkRes = new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl)
          // Min: 200x200, Max: 2000x2000
          if (img.width < 200 || img.height < 200) {
            reject("Logo must be at least 200x200 pixels")
          }
          if (img.width > 2000 || img.height > 2000) {
            reject("Logo must be no more than 2000x2000 pixels")
          }
          resolve(true)
        }
        img.onerror = () => reject("Invalid image file")
      })

      try {
        await checkRes
      } catch (err: any) {
        toast.error(err)
        return
      }
    }

    if (type === 'logo') setIsUploadingLogo(true)
    else setIsUploadingAvatar(true)

    const uploadData = new FormData()
    uploadData.append("file", file)
    uploadData.append("path", type === 'logo' ? `branding/${user.id}/${file.name}` : `avatars/${user.id}/${file.name}`)

    const result = await uploadEvidenceAction(uploadData)
    
    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      const field = type === 'logo' ? 'business_logo_url' : 'avatar_url'
      setFormData(prev => ({ ...prev, [field]: result.data.url }))
      toast.success(`${type === 'logo' ? 'Business Logo' : 'Profile Picture'} uploaded!`)
    }

    if (type === 'logo') setIsUploadingLogo(false)
    else setIsUploadingAvatar(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="size-20 border-2 border-muted">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="bg-primary/5 text-primary text-xl">
                  {formData.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {isUploadingAvatar ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
              </button>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleImageUpload(e, 'avatar')}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData(p => ({ ...prev, full_name: e.target.value }))}
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
                <p className="text-[10px] text-muted-foreground italic">Email changes are managed via auth provider.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Branding</CardTitle>
          <CardDescription>Configure the default logo used for all your pentest reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <Label>Default Report Logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative size-32 rounded-lg border border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
                {formData.business_logo_url ? (
                  <img src={formData.business_logo_url} alt="Business Logo" className="size-full object-contain p-4" />
                ) : (
                  <ImageIcon className="size-10 text-muted-foreground/30" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit"
                  disabled={isUploadingLogo}
                  onClick={() => document.getElementById('settings-logo-upload')?.click()}
                >
                  {formData.business_logo_url ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <input 
                  id="settings-logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, 'logo')}
                />
                <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Minimum resolution: 200x200px</li>
                  <li>Maximum resolution: 2000x2000px</li>
                  <li>Optimized to WebP automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 bg-muted/5">
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
