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
  const [error, setError] = useState("");

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-text-secondary text-sm">
            Sign in with your email to submit intel to the community.
          </p>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            error={error}
            autoFocus
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
      )}
    </Modal>
  );
}
