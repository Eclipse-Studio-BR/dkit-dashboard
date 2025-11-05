import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddressBadge } from "@/components/AddressBadge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MeResponse } from "@shared/schema";

const walletSchema = z.object({
  btcAddress: z.string().regex(/^(1|3|bc1)[a-zA-Z0-9]{25,62}$/, "Invalid Bitcoin address"),
});

type WalletForm = z.infer<typeof walletSchema>;

export default function WalletPage() {
  const { toast } = useToast();

  const { data: meData } = useQuery<MeResponse>({
    queryKey: ["/api/me"],
  });

  const form = useForm<WalletForm>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      btcAddress: "",
    },
    values: meData?.project ? { btcAddress: meData.project.btcAddress || "" } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: WalletForm) => {
      return apiRequest("PATCH", "/api/project", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Success",
        description: "Bitcoin address updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update Bitcoin address",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WalletForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your Bitcoin payout address</p>
      </div>

      {meData?.project.btcAddress && (
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Current Bitcoin Address</CardTitle>
            <CardDescription>Your affiliate payouts will be sent to this address</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressBadge address={meData.project.btcAddress} />
          </CardContent>
        </Card>
      )}

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Update Payout Address</CardTitle>
          <CardDescription>Change your Bitcoin address for receiving affiliate payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="btcAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitcoin Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="bc1q..."
                        data-testid="input-btc-address"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ensure you have full control of this wallet. On-chain payments are final and cannot be reversed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save">
                {updateMutation.isPending ? "Saving..." : "Save Address"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {!meData?.project.btcAddress && (
        <Card className="border-card-border bg-muted/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Add a Bitcoin address to receive monthly affiliate payouts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
