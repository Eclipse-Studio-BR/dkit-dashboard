import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import WalletPage from "@/pages/wallet";
import ApiKeyDetailsPage from "@/pages/api-key-details";
import SettingsPage from "@/pages/settings";
import SupportPage from "@/pages/support";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard">
        <ProtectedLayout>
          <DashboardPage />
        </ProtectedLayout>
      </Route>
      <Route path="/api-keys">
        <ProtectedLayout>
          <WalletPage />
        </ProtectedLayout>
      </Route>
      <Route path="/api-keys/:id">
        <ProtectedLayout>
          <ApiKeyDetailsPage />
        </ProtectedLayout>
      </Route>
      <Route path="/settings">
        <ProtectedLayout>
          <SettingsPage />
        </ProtectedLayout>
      </Route>
      <Route path="/support">
        <ProtectedLayout>
          <SupportPage />
        </ProtectedLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
