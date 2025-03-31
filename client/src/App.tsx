import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/ui/navbar";
import NotFound from "@/pages/not-found";
import ChatBot from "@/pages/ChatBot";
import AdminFaq from "@/pages/AdminFaq";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatBot} />
      <Route path="/admin/faq" component={AdminFaq} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
