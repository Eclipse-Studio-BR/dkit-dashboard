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
      <div className="flex flex-col h-screen w-full">
        <div className="bg-blue-900/30 border-b border-blue-500/50 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-200">
            <AlertTriangle className="w-4 h-4" />
            <span>dKit Partners Dashboard alpha version. In Development.</span>
          </div>
        </div>
        <AppHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
