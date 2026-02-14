import type { Metadata } from "next";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Rocket, BarChart3, Users, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Deployment Plan",
  description:
    "How HargaHantu is deployed and its measurable community benefit.",
};

export default function DeploymentPage() {
  return (
    <>
      <TopBar title="DEPLOYMENT PLAN" showBack />
      <PageContainer className="space-y-6 pt-4 pb-24">
        <div>
          <h2 className="font-mono text-lg font-bold text-text-primary">
            Deployment & Community Impact
          </h2>
          <p className="text-text-secondary text-sm mt-2">
            How HargaHantu is deployed and how we measure community benefit.
          </p>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Deployment Architecture
            </h3>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="neon">Frontend</Badge>
                <span>Next.js on Vercel — Global Edge Network, automatic SSL, preview deployments</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="neon">Database</Badge>
                <span>Supabase Postgres — Managed database with Row Level Security, automatic backups</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="neon">Storage</Badge>
                <span>Supabase Storage — Private bucket for receipt images with signed URLs</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="neon">AI</Badge>
                <span>OpenAI API — Vision-based receipt extraction (pay-per-use)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <h4 className="font-mono text-xs text-text-primary mb-2">
                Deploy Steps:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Create Supabase project, run SQL migration</li>
                <li>Push to GitHub, import in Vercel</li>
                <li>Set environment variables in Vercel dashboard</li>
                <li>Deploy — live in under 5 minutes</li>
              </ol>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Community Benefit Metrics
            </h3>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              HargaHantu measures community impact through these key metrics:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-surface-elevated rounded border border-border">
                <div className="font-mono text-xs text-neon mb-1">
                  Price Transparency Index
                </div>
                <p className="text-xs">
                  Number of unique item-area combinations with 5+ price points.
                  Target: 100+ within first month. This means reliable price data
                  for 100+ everyday items across Malaysian cities.
                </p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border">
                <div className="font-mono text-xs text-neon mb-1">
                  Savings Potential
                </div>
                <p className="text-xs">
                  Average price difference between cheapest and most expensive
                  merchant for each item. Measures how much money users can save
                  by choosing the cheapest option.
                </p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border">
                <div className="font-mono text-xs text-neon mb-1">
                  Contributor Growth
                </div>
                <p className="text-xs">
                  Number of unique users submitting receipts per week. Target: 50+
                  active contributors in month one.
                </p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border">
                <div className="font-mono text-xs text-neon mb-1">
                  Data Freshness
                </div>
                <p className="text-xs">
                  Percentage of tracked items with price data from the last 7
                  days. Target: 80%+ freshness for top 50 staple items.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Scalability
            </h3>
          </div>
          <div className="text-sm text-text-secondary space-y-2">
            <p>HargaHantu is designed to scale with the community:</p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>Vercel auto-scales with traffic (serverless)</li>
              <li>Supabase Postgres handles millions of price points</li>
              <li>Trigram search indexes ensure fast queries at any scale</li>
              <li>PWA with service worker caching reduces server load</li>
              <li>AI costs are per-extraction, scaling linearly with usage</li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Performance Targets
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              { label: "Performance", target: "90+" },
              { label: "Accessibility", target: "90+" },
              { label: "Best Practices", target: "90+" },
              { label: "SEO", target: "90+" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="p-3 bg-surface-elevated rounded border border-border"
              >
                <div className="font-mono text-lg text-neon">
                  {metric.target}
                </div>
                <div className="text-[10px] font-mono text-text-muted">
                  Lighthouse {metric.label}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
