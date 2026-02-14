"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScanLayout } from "@/components/layout/ScanLayout";

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Dynamically import compression to avoid loading it eagerly
      const imageCompression = (await import("browser-image-compression"))
        .default;

      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        sessionStorage.setItem(
          "hh-pending-image",
          reader.result as string
        );
        router.push("/scan/crop");
      };
      reader.readAsDataURL(compressed);
    },
    [router]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <ScanLayout title="SCAN RECEIPT" step={1}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-surface-elevated border border-border flex items-center justify-center">
            <Camera size={32} className="text-neon" aria-hidden="true" />
          </div>
          <h2 className="font-mono text-sm text-text-primary">
            Capture or Upload
          </h2>
          <p className="text-text-secondary text-xs max-w-xs">
            Take a photo of your receipt or upload an existing image. We&apos;ll
            decrypt the prices for the community.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* Camera capture */}
          <Button
            variant="neon"
            size="lg"
            className="w-full"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={18} aria-hidden="true" />
            Take Photo
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Take photo of receipt"
          />

          {/* File upload */}
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} aria-hidden="true" />
            Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload receipt image"
          />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
          <ImageIcon size={12} aria-hidden="true" />
          <span>JPG, PNG or WebP · Max 5MB</span>
        </div>
      </div>
    </ScanLayout>
  );
}
