
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* <Toaster /> */}
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/" element={<Home />} />
      ) : (
        <Route path="/login" element={<Login />} />
      )}
      <Route path="/login/success" element={<HomeRedirect />} />
      {/* Optionally, redirect all other routes */}
      <Route path="*" element={isAuthenticated ? <Home /> : <Login />} />
    </Routes>
  );
}

function HomeRedirect() {
  const { setIsAuthenticated} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    setIsAuthenticated(true)
  }, []);
  return (<>

  </>);
}

export default App;
