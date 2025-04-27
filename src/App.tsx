
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";
import EnterMetaverse from "./pages/EnterMetaverse";
import MetaverseWorld from "./pages/MetaverseWorld";
import Index from "./pages/Index";
import { toast } from "sonner";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Improved AuthCheck to enforce the login flow
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const userData = localStorage.getItem('pixel_commons_user');
  
  useEffect(() => {
    // Check if we have valid user data
    if (!userData && location.pathname !== '/' && location.pathname !== '/enter') {
      toast.error('Please enter your details first');
    }
  }, [userData, location.pathname]);
  
  if (location.pathname === '/' || location.pathname === '/enter' || userData) {
    return <>{children}</>;
  }
  
  // Always redirect to enter page if not authenticated
  return <Navigate to="/enter" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Redirect from root to enter metaverse page */}
        <Route path="/" element={<Navigate to="/enter" />} />
        <Route path="/enter" element={<EnterMetaverse />} />
        <Route path="/world" element={
          <AuthCheck>
            <MetaverseWorld />
          </AuthCheck>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
