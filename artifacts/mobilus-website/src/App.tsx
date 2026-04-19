import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import { I18nProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Moto from "@/pages/moto";
import Velo from "@/pages/velo";
import Contact from "@/pages/contact";
import Leasing from "@/pages/leasing";
import About from "@/pages/about";
import ProductPage from "@/pages/product";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/moto" component={Moto} />
        <Route path="/moto/:slug" component={ProductPage} />
        <Route path="/velo" component={Velo} />
        <Route path="/contact" component={Contact} />
        <Route path="/leasing" component={Leasing} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Layout>
              <Router />
            </Layout>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
