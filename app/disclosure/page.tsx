import type { Metadata } from "next";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bot, Code, Eye, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Disclosure",
  description:
    "Transparency about AI usage in HargaHantu. We believe in honest disclosure.",
};

export default function DisclosurePage() {
  return (
    <>
      <TopBar title="AI DISCLOSURE" showBack />
      <PageContainer className="space-y-6 pt-4 pb-24">
        <div>
          <h2 className="font-mono text-lg font-bold text-text-primary">
            AI Disclosure Statement
          </h2>
          <p className="text-text-secondary text-sm mt-2">
            Transparency is core to HargaHantu. Here is a complete disclosure of
            all AI assistance used in building and operating this application.
          </p>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Bot size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              AI in Development
            </h3>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              This application was built with significant AI assistance using{" "}
              <strong className="text-text-primary">Claude Code</strong> (Claude Opus 4.6)
              by Anthropic. The AI assisted with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>Architecture design and technical planning</li>
              <li>Code generation for React components, API routes, and database schemas</li>
              <li>TypeScript type definitions and Zod validation schemas</li>
              <li>Tailwind CSS styling and animation implementation</li>
              <li>Supabase database setup including RLS policies and RPC functions</li>
              <li>Performance optimization strategies</li>
              <li>Accessibility implementation (ARIA attributes, keyboard navigation)</li>
            </ul>
            <p>
              All generated code was reviewed, tested, and refined by the solo
              developer. The AI served as a pair programmer, not as an autonomous
              builder.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              AI in Operation
            </h3>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              HargaHantu uses AI vision models to extract data from receipt
              images:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="neon">Primary</Badge>
                <span>
                  <strong className="text-text-primary">OpenAI GPT-4o</strong> —
                  Vision-based receipt parsing. Extracts merchant name, items,
                  prices, and totals from receipt images.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="muted">Optional</Badge>
                <span>
                  <strong className="text-text-primary">
                    Anthropic Claude
                  </strong>{" "}
                  — Alternative extraction provider. Configurable via environment
                  variable.
                </span>
              </div>
            </div>
            <p>
              The AI extraction is a <strong className="text-text-primary">preview</strong> step.
              Users always review and confirm extracted data before it is submitted
              to the community database. The AI does not make autonomous decisions
              about pricing data.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Data & Privacy
            </h3>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>
                Receipt images are sent to the AI provider for extraction only.
                They are not used for AI training.
              </li>
              <li>
                Receipt images are stored privately. Only the submitting user can
                access their own images.
              </li>
              <li>
                Only anonymized price data (item, price, merchant, area, date)
                is made public. No user identity is attached to public data.
              </li>
              <li>
                Raw OCR text is not stored. Only structured, validated data is
                persisted.
              </li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Code size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Tools Used
            </h3>
          </div>
          <div className="text-sm text-text-secondary space-y-2">
            <p>Complete technology stack:</p>
            <div className="flex flex-wrap gap-1">
              {[
                "Next.js 16",
                "TypeScript",
                "Tailwind CSS v4",
                "Supabase",
                "Framer Motion",
                "GSAP",
                "Three.js",
                "Zod",
                "OpenAI API",
                "Claude Code",
                "Vercel",
              ].map((tech) => (
                <Badge key={tech} variant="muted">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
