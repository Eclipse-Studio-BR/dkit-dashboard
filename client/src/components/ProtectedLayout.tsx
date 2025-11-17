import { AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppHeader } from "@/components/AppHeader";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout for authenticated pages with the banner and header.
 */
export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen w-full">
        <div
          className="border-b px-4 py-2"
          style={{ background: "var(--accent-yellow-gradient)" }}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-[#0b0d12] font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Arqitech Dashboard alpha version. In Development.</span>
          </div>
        </div>
        <AppHeader />
        <main className="flex-1 w-full">
          <div className="p-4 md:p-8 space-y-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
