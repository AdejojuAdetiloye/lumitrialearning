import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ThankYou from "./pages/ThankYou";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import ParentRegister from "./pages/auth/ParentRegister";
import ParentDashboard from "./pages/dashboard/ParentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
import ChildTimetablePage from "./pages/dashboard/ChildTimetablePage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<ParentRegister />} />
              <Route
                path="/dashboard/parent"
                element={
                  <ProtectedRoute role="PARENT">
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/parent/child/:childId"
                element={
                  <ProtectedRoute role="PARENT">
                    <ChildTimetablePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute roles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/manager"
                element={
                  <ProtectedRoute roles={["MANAGER"]}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/instructor"
                element={
                  <ProtectedRoute roles={["INSTRUCTOR"]}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
