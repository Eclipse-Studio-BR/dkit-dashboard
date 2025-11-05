import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, insertProjectSchema } from "@shared/schema";

const step1Schema = insertUserSchema.merge(
  insertProjectSchema.pick({ name: true, logoUrl: true, dappUrl: true })
);

const step2Schema = insertProjectSchema.pick({ btcAddress: true });

const step3Schema = insertProjectSchema.pick({ 
  thorName: true, 
  mayaName: true, 
  chainflipAddress: true 
});

const fullSchema = insertUserSchema.merge(insertProjectSchema);

type OnboardingForm = z.infer<typeof fullSchema>;

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingForm>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      logoUrl: "",
      dappUrl: "",
      btcAddress: "",
      thorName: "",
      mayaName: "",
      chainflipAddress: "",
    },
    mode: "onSubmit",
  });

  const validateStep = async () => {
    const values = form.getValues();
    
    try {
      if (step === 1) {
        step1Schema.parse(values);
      } else if (step === 2) {
        step2Schema.parse(values);
      } else {
        step3Schema.parse(values);
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof OnboardingForm;
          form.setError(field, { message: error.message });
        });
      }
      return false;
    }
  };

  const onNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: OnboardingForm) => {
    setIsLoading(true);
    try {
      const validationResult = fullSchema.safeParse(data);
      
      if (!validationResult.success) {
        validationResult.error.errors.forEach((error) => {
          const field = error.path[0] as keyof OnboardingForm;
          form.setError(field, { message: error.message });
        });
        setIsLoading(false);
        return;
      }
      
      const { email, password, name, logoUrl, dappUrl, btcAddress, thorName, mayaName, chainflipAddress } = validationResult.data;
      
      const projectData: any = { name };
      if (logoUrl) projectData.logoUrl = logoUrl;
      if (dappUrl) projectData.dappUrl = dappUrl;
      if (btcAddress) projectData.btcAddress = btcAddress;
      if (thorName) projectData.thorName = thorName;
      if (mayaName) projectData.mayaName = mayaName;
      if (chainflipAddress) projectData.chainflipAddress = chainflipAddress;
      
      console.log("[ONBOARDING] Submitting registration:", { email, project: projectData });
      
      await apiRequest("POST", "/api/auth/register", { email, password, project: projectData });
      toast({
        title: "Account created successfully",
        description: "Welcome to dKiT Partners Dashboard",
      });
      setLocation("/");
    } catch (error: any) {
      console.error("[ONBOARDING] Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-card-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome to dKiT Partners</CardTitle>
          <CardDescription>
            Step {step} of 3 - {step === 1 ? "Account & Project Basics" : step === 2 ? "Payout Settings" : "Tracking IDs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="partner@example.com" data-testid="input-email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" data-testid="input-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My DeFi Project" data-testid="input-project-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dappUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>dApp Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.app" data-testid="input-dapp-url" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <label className="text-sm font-medium mb-2 block">Project Logo</label>
                    <Input type="file" accept="image/*" disabled data-testid="input-project-logo" />
                    <p className="text-xs text-muted-foreground mt-1">Upload your project logo (coming soon)</p>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="btcAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bitcoin Address for Payouts</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="bc1q..."
                            data-testid="input-btc-address"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Affiliate payouts are sent to your Bitcoin address. Use a wallet you control; on-chain payments are final.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <FormField
                    control={form.control}
                    name="thorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>THORName</FormLabel>
                        <FormControl>
                          <Input placeholder="your-thorname" data-testid="input-thor-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mayaName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MayaName</FormLabel>
                        <FormControl>
                          <Input placeholder="your-mayaname" data-testid="input-maya-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chainflipAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chainflip Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0xabc...def" data-testid="input-chainflip-address" {...field} />
                        </FormControl>
                        <FormDescription>
                          We attribute swaps and fees to your project using these IDs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex gap-2 pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={onNext} className="ml-auto" data-testid="button-continue">
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="ml-auto" data-testid="button-finish">
                    {isLoading ? "Creating account..." : "Finish"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
              data-testid="link-sign-in"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
