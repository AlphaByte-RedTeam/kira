"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"
import GithubIcon from "@/components/ui/github-icon"
import BrandGoogleIcon from "@/components/ui/brand-google-icon"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2">
        <ShieldCheck className="size-10 text-primary" />
        <h1 className="text-3xl font-bold tracking-tighter">Kira</h1>
      </div>
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Securely sign in to manage your pentest reports
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            className="h-12 text-base font-medium transition-all hover:bg-primary/5"
            onClick={() => handleLogin('github')}
            disabled={isLoading}
          >
            <GithubIcon size={20} className="mr-2" />
            Continue with GitHub
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-medium transition-all hover:bg-primary/5"
            onClick={() => handleLogin('google')}
            disabled={isLoading}
          >
            <BrandGoogleIcon size={20} className="mr-2" />
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
