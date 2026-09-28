"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, LogIn, Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg("Logged in successfully (Demo Session Mode)");
        setTimeout(() => router.push("/"), 800);
      }, 600);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSuccessMsg("Logged in successfully!");
      setTimeout(() => router.push("/"), 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoBypass = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg("Logged in as Demo Admin");
      setTimeout(() => router.push("/"), 600);
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 pt-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8ba298] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <Card className="border-[#14241c] bg-[#0d1511] shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00e599] text-[#03140e] shadow-[0_0_14px_rgba(0,229,153,0.3)] font-extrabold">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-xs text-[#8ba298]">
            Sign in to access Lead Intelligence workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded-lg border border-rose-500/30 bg-[#2e0b0e] p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg border border-[#00e599]/30 bg-[#042a1d] p-3 text-xs text-[#00e599] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#00e599] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8ba298]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5e756b]" />
                <Input
                  type="email"
                  required
                  placeholder="admin@lead-intelligence.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8ba298]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5e756b]" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#14241c]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0d1511] px-2 text-[#5e756b] font-mono text-[10px]">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={handleDemoBypass}
            disabled={isLoading}
            className="w-full text-xs"
          >
            <ShieldCheck className="h-4 w-4 mr-2 text-[#00e599]" />
            Quick Demo Login (Bypass)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
