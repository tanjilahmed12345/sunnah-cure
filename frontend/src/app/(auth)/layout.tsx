import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <span className="text-lg font-bold text-primary-foreground">SC</span>
        </div>
        <span className="text-2xl font-bold text-primary">Sunnah Cure</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
