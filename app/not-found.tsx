import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
      <div className="text-center space-y-4 max-w-sm">
        <div className="font-mono text-6xl text-neon">404</div>
        <h1 className="font-mono text-xl text-text-primary">
          INTEL NOT FOUND
        </h1>
        <p className="text-text-secondary text-sm">
          This page doesn&apos;t exist or has been classified.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-4 rounded-md font-mono text-sm text-neon border border-neon hover:bg-neon/10 transition-colors"
        >
          Return to Base
        </Link>
      </div>
    </div>
  );
}
