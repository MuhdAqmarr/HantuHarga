import type { Metadata } from "next";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Shield, Eye, Database, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HargaHantu handles your data. Your receipts are private.",
};

export default function PrivacyPage() {
  return (
    <>
      <TopBar title="PRIVACY" showBack />
      <PageContainer className="space-y-6 pt-4 pb-24">
        <div>
          <h2 className="font-mono text-lg font-bold text-text-primary">
            Privacy Policy
          </h2>
          <p className="text-text-secondary text-sm mt-2">
            Your privacy matters. Here&apos;s exactly how we handle your data.
          </p>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Receipt Images
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              Receipt images are stored in a <strong className="text-text-primary">private storage bucket</strong>. Only you can access your own images.
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              Images are sent to an AI provider (OpenAI or Anthropic) for text extraction only. They are not used for AI model training.
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              You can delete your account and all associated data at any time.
            </li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              Community Data
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              Public price data is <strong className="text-text-primary">fully anonymized</strong>. No user ID, email, or personal info is attached to price points.
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              Community data includes: item name, price, merchant, area, and date only.
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              Raw OCR text from receipts is not stored in the public database.
            </li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-neon" aria-hidden="true" />
            <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
              What We Collect
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              <strong className="text-text-primary">Email address</strong> — for authentication via magic link only.
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              <strong className="text-text-primary">Receipt data</strong> — items, prices, merchant, area, date (private to your account).
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">+</span>
              <strong className="text-text-primary">Receipt images</strong> — stored privately, accessible only by you.
            </li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Trash2 size={14} className="text-orange" aria-hidden="true" />
            <h3 className="font-mono text-xs text-orange uppercase tracking-wider">
              Data Deletion
            </h3>
          </div>
          <p className="text-sm text-text-secondary">
            You may request deletion of your account and all private data
            (receipts, images) by contacting us. Anonymized price points that
            have already been aggregated into community statistics will remain,
            as they contain no personally identifiable information.
          </p>
        </Card>
      </PageContainer>
    </>
  );
}
