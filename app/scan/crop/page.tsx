"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/Button";
import { ScanLayout } from "@/components/layout/ScanLayout";
import { RotateCw, Check } from "lucide-react";

export default function CropPage() {
  const router = useRouter();
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("hh-pending-image");
    if (!stored) {
      router.replace("/scan");
      return;
    }
    setImageSrc(stored);
  }, [router]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    const img = imgRef.current;

    // Apply crop and rotation
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

    if (crop && crop.width && crop.height) {
      sx = crop.x * scaleX;
      sy = crop.y * scaleY;
      sw = crop.width * scaleX;
      sh = crop.height * scaleY;
    }

    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? sh : sw;
    canvas.height = isRotated ? sw : sh;

    const ctx = canvas.getContext("2d")!;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      sx, sy, sw, sh,
      -sw / 2, -sh / 2, sw, sh
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          sessionStorage.setItem(
            "hh-cropped-image",
            reader.result as string
          );
          router.push("/scan/process");
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.85
    );
  }, [crop, rotation, router]);

  if (!imageSrc) {
    return (
      <ScanLayout title="CROP" step={2}>
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-sm text-text-muted">Loading...</div>
        </div>
      </ScanLayout>
    );
  }

  return (
    <ScanLayout title="CROP & ADJUST" step={2}>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
          <ReactCrop crop={crop} onChange={setCrop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Receipt to crop"
              style={{
                maxHeight: "60vh",
                maxWidth: "100%",
                transform: `rotate(${rotation}deg)`,
              }}
            />
          </ReactCrop>
        </div>

        <div className="p-4 flex items-center justify-between border-t border-border">
          <Button variant="ghost" size="md" onClick={handleRotate}>
            <RotateCw size={16} aria-hidden="true" />
            Rotate
          </Button>
          <Button variant="neon" size="md" onClick={handleConfirm}>
            <Check size={16} aria-hidden="true" />
            Continue
          </Button>
        </div>
      </div>
    </ScanLayout>
  );
}
