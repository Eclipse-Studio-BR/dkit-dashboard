import { useLocation } from "wouter";
import { useEffect } from "react";
import { useMe } from "@/hooks/use-me";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useMe();

  useEffect(() => {
    if (!isLoading && (error || !data)) {
      setLocation("/login");
    }
  }, [data, isLoading, error, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return <>{children}</>;
}
