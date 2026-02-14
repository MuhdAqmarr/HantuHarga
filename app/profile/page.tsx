"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AuthModal } from "@/components/features/AuthModal";
import { useReduceMotion } from "@/components/ReduceMotionProvider";
import { createClient } from "@/lib/supabase/browser";
import {
  User,
  Receipt,
  LogOut,
  Eye,
  EyeOff,
  FileText,
  Shield,
  Rocket,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const { reduceMotion, toggleReduceMotion } = useReduceMotion();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [receiptCount, setReceiptCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);

      if (user) {
        supabase
          .from("receipts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .then(({ count }) => {
            setReceiptCount(count || 0);
          });
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setReceiptCount(0);
    router.refresh();
  }, [router]);

  if (loading) {
    return (
      <>
        <TopBar title="PROFILE" />
        <PageContainer>
          <div className="py-12 text-center font-mono text-sm text-text-muted">
            Loading...
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <TopBar title="AGENT PROFILE" />
      <PageContainer className="space-y-4 pt-4">
        {user ? (
          <>
            {/* User info */}
            <Card>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center">
                  <User size={18} className="text-neon" />
                </div>
                <div>
                  <div className="font-mono text-sm text-text-primary">
                    {user.email}
                  </div>
                  <Badge variant="neon">ACTIVE AGENT</Badge>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Receipt
                  size={14}
                  className="text-neon"
                  aria-hidden="true"
                />
                <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
                  Contribution Stats
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-2xl text-neon">
                    {receiptCount}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted">
                    Receipts Submitted
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl text-text-primary">
                    {receiptCount > 5 ? "VETERAN" : receiptCount > 0 ? "ROOKIE" : "NEW"}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted">
                    Agent Rank
                  </div>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <div className="text-center py-4 space-y-3">
              <div className="font-mono text-sm text-text-muted">
                [ NOT AUTHENTICATED ]
              </div>
              <p className="text-text-secondary text-xs">
                Sign in to submit receipts and track your contributions.
              </p>
              <Button
                variant="neon"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </Button>
            </div>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-3">
            Settings
          </h3>
          <div className="space-y-2">
            <button
              onClick={toggleReduceMotion}
              className="w-full flex items-center justify-between py-2 px-1 rounded hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-2">
                {reduceMotion ? (
                  <EyeOff size={14} className="text-text-muted" />
                ) : (
                  <Eye size={14} className="text-text-muted" />
                )}
                <span className="text-sm text-text-primary">
                  Reduce Motion
                </span>
              </div>
              <Badge variant={reduceMotion ? "neon" : "muted"}>
                {reduceMotion ? "ON" : "OFF"}
              </Badge>
            </button>
          </div>
        </Card>

        {/* Links */}
        <Card>
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-3">
            Information
          </h3>
          <div className="space-y-1">
            <Link
              href="/disclosure"
              className="flex items-center gap-2 py-2 px-1 rounded hover:bg-surface-elevated transition-colors"
            >
              <FileText size={14} className="text-text-muted" />
              <span className="text-sm text-text-primary">
                AI Disclosure
              </span>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-2 py-2 px-1 rounded hover:bg-surface-elevated transition-colors"
            >
              <Shield size={14} className="text-text-muted" />
              <span className="text-sm text-text-primary">
                Privacy Policy
              </span>
            </Link>
            <Link
              href="/deployment"
              className="flex items-center gap-2 py-2 px-1 rounded hover:bg-surface-elevated transition-colors"
            >
              <Rocket size={14} className="text-text-muted" />
              <span className="text-sm text-text-primary">
                Deployment Plan
              </span>
            </Link>
          </div>
        </Card>

        {user && (
          <Button
            variant="danger"
            size="md"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut size={14} aria-hidden="true" />
            Sign Out
          </Button>
        )}
      </PageContainer>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </>
  );
}
