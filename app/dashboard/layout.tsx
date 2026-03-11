import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
      {children}
    </div>
  );
}
