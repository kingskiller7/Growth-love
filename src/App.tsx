// Growth Trading Platform - Main Application Router
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "./pages/Index";
import AppLanding from "./pages/AppLanding";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ProfileSetup from "./pages/auth/ProfileSetup";
import SecuritySetup from "./pages/auth/SecuritySetup";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Portfolio from "./pages/Portfolio";
import Agents from "./pages/Agents";
import Algo from "./pages/Algo";
import Settings from "./pages/Settings";
import Wallet from "./pages/Wallet";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Analytics from "./pages/Analytics";
import SecuritySettings from "./pages/SecuritySettings";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PoolManagement from "./pages/admin/PoolManagement";
import UserManagement from "./pages/admin/UserManagement";
import GovernanceManagement from "./pages/admin/GovernanceManagement";
import MakeUserAdmin from "./pages/admin/MakeUserAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app-landing" element={<AppLanding />} />
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
            <Route path="/security-setup" element={<ProtectedRoute><SecuritySetup /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/algo" element={<ProtectedRoute><Algo /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/agents" element={<AdminRoute><Agents /></AdminRoute>} />
                <Route path="/admin/pools" element={<AdminRoute><PoolManagement /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/admin/governance" element={<AdminRoute><GovernanceManagement /></AdminRoute>} />
                <Route path="/admin/make-admin" element={<AdminRoute><MakeUserAdmin /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
