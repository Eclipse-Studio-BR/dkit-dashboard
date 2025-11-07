import { Button } from "@/components/ui/button";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button>Create new Key</Button>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">There are no API keys yet.</p>
      </div>
    </div>
  );
}
