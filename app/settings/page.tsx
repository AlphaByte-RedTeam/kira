import { redirect } from "next/navigation";
import AppLayout from "@/app/app-layout";
import { ProfileSettings } from "@/components/profile-settings";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AppLayout>
      <Container size="md" className="flex-1 py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your personal information and business branding.
            </p>
          </div>
          <ProfileSettings user={user} profile={profile} />
        </div>
      </Container>
    </AppLayout>
  );
}
