import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SettingsProvider } from "@/hooks/useSettings";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Search from "./pages/Search";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOrders from "./pages/SellerOrders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Error from "./pages/Error";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
          <Routes>
            {/* Standalone auth page without layout */}
            <Route path="/auth" element={<Auth />} />
            
            {/* All other pages use MainLayout */}
            <Route path="/" element={
              <MainLayout>
                <Home />
              </MainLayout>
            } />
            <Route path="/marketplace" element={
              <MainLayout>
                <Marketplace />
              </MainLayout>
            } />
            <Route path="/search" element={
              <MainLayout>
                <Search />
              </MainLayout>
            } />
            <Route path="/wishlist" element={
              <MainLayout>
                <Wishlist />
              </MainLayout>
            } />
            <Route path="/cart" element={
              <MainLayout>
                <Cart />
              </MainLayout>
            } />
            <Route path="/seller" element={
              <MainLayout>
                <SellerDashboard />
              </MainLayout>
            } />
            <Route path="/seller/orders" element={
              <MainLayout>
                <SellerOrders />
              </MainLayout>
            } />
            <Route path="/admin" element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/product/:id" element={
              <MainLayout>
                <ProductDetail />
              </MainLayout>
            } />
            <Route path="/checkout" element={
              <MainLayout>
                <Checkout />
              </MainLayout>
            } />
            <Route path="/success" element={
              <MainLayout>
                <Success />
              </MainLayout>
            } />
            <Route path="/error" element={
              <MainLayout>
                <Error />
              </MainLayout>
            } />
            <Route path="/privacy" element={
              <MainLayout>
                <Privacy />
              </MainLayout>
            } />
            <Route path="/terms" element={
              <MainLayout>
                <Terms />
              </MainLayout>
            } />
            <Route path="/help" element={
              <MainLayout>
                <Help />
              </MainLayout>
            } />
            <Route path="/about" element={
              <MainLayout>
                <About />
              </MainLayout>
            } />
            <Route path="/profile" element={
              <MainLayout>
                <Profile />
              </MainLayout>
            } />
            <Route path="*" element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            } />
          </Routes>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;