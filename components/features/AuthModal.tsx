"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/browser";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function AuthModal({ open, onClose, redirectTo }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`,
      },
    });

    setGoogleLoading(false);
    if (authError) {
      setError(authError.message);
    }
  }, [redirectTo]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      setLoading(true);
      setError("");

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`,
        },
      });

      setLoading(false);
      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    },
    [email, redirectTo]
  );

  return (
    <Modal open={open} onClose={onClose} title="AUTHENTICATION REQUIRED">
      {sent ? (
        <div className="space-y-4 text-center py-4">
          <div className="font-mono text-neon text-sm">
            [ MAGIC LINK SENT ]
          </div>
          <p className="text-text-secondary text-sm">
            Check your email for the login link. It may take a minute.
          </p>
          <Button variant="ghost" size="sm" onClick={() => { setSent(false); setEmail(""); }}>
            Try different email
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Sign in to submit intel to the community.
          </p>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            size="md"
            loading={googleLoading}
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2 shrink-0" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-text-muted text-xs font-mono">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Magic link */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              error={error}
            />
            <Button
              type="submit"
              variant="neon"
              size="md"
              loading={loading}
              className="w-full"
            >
              Send Magic Link
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
}
