import React, { useState } from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Global Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import SearchOverlay from './components/search/SearchOverlay';
import PageTransition from './components/common/PageTransition';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import GenderCategory from './pages/GenderCategory';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Discovery from './pages/Discovery';
import Compare from './pages/Compare';
import ThePalace from './pages/ThePalace';
import TheHouse from './pages/TheHouse';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchPage from './pages/SearchPage';

// 3D Effects
import ArabianIntro from './components/3d effects/ArabianIntro';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Account Pages
import AccountLayout from './pages/account/AccountLayout';
import AccountOverview from './pages/account/AccountOverview';
import AccountOrders from './pages/account/AccountOrders';
import OrderDetail from './pages/account/OrderDetail';
import AccountWishlist from './pages/account/AccountWishlist';
import AccountAddresses from './pages/account/AccountAddresses';
import AccountPaymentMethods from './pages/account/AccountPaymentMethods';
import AccountSettings from './pages/account/AccountSettings';

// Commerce Pages
import CartPage from './pages/checkout/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderConfirmation from './pages/checkout/OrderConfirmation';
import OrderTracking from './pages/checkout/OrderTracking';

// Admin Suite Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminSettings from './pages/admin/AdminSettings';

// Error Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

function MainRouter() {
  const { currentPath } = useRouter();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const isAdminRoute = currentPath.startsWith('/admin');
  const isAccountRoute = currentPath.startsWith('/account');

  // Route Dispatcher
  const renderContent = () => {
    // 1. Admin Routes
    if (isAdminRoute) {
      if (!isAdmin) {
        return <Unauthorized />;
      }

      return (
        <AdminLayout>
          {currentPath === '/admin' && <AdminDashboard />}
          {currentPath === '/admin/products' && <AdminProducts />}
          {(currentPath === '/admin/products/new' || (currentPath.startsWith('/admin/products/') && currentPath.endsWith('/edit'))) && (
            <AdminProductEdit />
          )}
          {currentPath === '/admin/orders' && <AdminOrders />}
          {currentPath === '/admin/users' && <AdminUsers />}
          {currentPath === '/admin/inventory' && <AdminInventory />}
          {currentPath === '/admin/analytics' && <AdminAnalytics />}
          {(currentPath === '/admin/coupons' || currentPath === '/admin/discounts' || currentPath === '/dashboard/coupons') && <AdminDiscounts />}
          {currentPath === '/admin/settings' && <AdminSettings />}
        </AdminLayout>
      );
    }

    // 2. Customer Account Routes
    if (isAccountRoute) {
      if (!isAuthenticated) {
        return <Login returnPath={currentPath} />;
      }

      return (
        <AccountLayout>
          {currentPath === '/account' && <AccountOverview />}
          {currentPath === '/account/orders' && <AccountOrders />}
          {currentPath.startsWith('/account/orders/') && currentPath !== '/account/orders' && (
            <OrderDetail />
          )}
          {currentPath === '/account/wishlist' && <AccountWishlist />}
          {currentPath === '/account/addresses' && <AccountAddresses />}
          {currentPath === '/account/payment-methods' && <AccountPaymentMethods />}
          {currentPath === '/account/settings' && <AccountSettings />}
        </AccountLayout>
      );
    }

    // 3. Commerce Routes
    if (currentPath === '/cart') {
      return <CartPage />;
    }
    if (currentPath === '/checkout') {
      return <CheckoutPage />;
    }

    // 4. Public, Discovery, Compare, Product, Auth Routes
    switch (true) {
      case currentPath === '/':
        return <Home />;
      case currentPath.startsWith('/shop'):
        return <Shop />;
      case currentPath === '/discovery':
        return <Discovery />;
      case currentPath === '/compare':
        return <Compare />;
      case currentPath === '/men':
        return <GenderCategory genderType="men" />;
      case currentPath === '/women':
        return <GenderCategory genderType="women" />;
      case currentPath === '/unisex':
        return <GenderCategory genderType="unisex" />;
      case currentPath.startsWith('/collections'):
        return <Collections />;
      case currentPath.startsWith('/product/'):
        return <ProductDetail />;
      case currentPath.startsWith('/the-palace'):
      case currentPath.startsWith('/the-house'):
        return <ThePalace />;
      case currentPath === '/about':
        return <About />;
      case currentPath === '/contact':
        return <Contact />;
      case currentPath.startsWith('/search'):
        return <SearchPage />;

      // Auth
      case currentPath === '/login':
      case currentPath === '/auth/login':
        return <Login />;
      case currentPath === '/signup':
      case currentPath === '/auth/signup':
        return <Signup />;
      case currentPath === '/forgot-password':
      case currentPath === '/auth/forgot-password':
        return <ForgotPassword />;
      case currentPath.startsWith('/reset-password'):
      case currentPath.startsWith('/auth/reset-password'):
        return <ResetPassword />;

      // Commerce confirmation & tracking
      case currentPath.startsWith('/order-confirmation'):
        return <OrderConfirmation />;
      case currentPath.startsWith('/order-tracking'):
        return <OrderTracking />;

      default:
        return <NotFound />;
    }
  };

  const { isDark } = useTheme();

  return (
    <div className={`relative flex flex-col min-h-screen transition-colors duration-500 overflow-x-hidden ${
      isDark ? 'text-[#F5EAD3] bg-[#100A06]' : 'text-[#704622] bg-[#EAE0CC]'
    }`}>

      {/* Global Luxury Gradient Background (DV2 & LV1 Design Tokens) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 overflow-hidden"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 95% 75% at 50% 10%, #221408 0%, #150D06 50%, #100A06 100%), linear-gradient(180deg, #100A06 0%, #1B1008 50%, #100A06 100%)'
            : 'radial-gradient(ellipse 95% 75% at 50% 10%, #F6EFDF 0%, #EAE0CC 50%, #DFD1B6 100%), linear-gradient(180deg, #EAE0CC 0%, #F3EBDA 50%, #E7DBC4 100%)'
        }}
      />

      {/* Standalone Cinematic Intro */}
      {showIntro && !isAdminRoute && (
        <ArabianIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Customer Header (hidden on Admin pages) */}
      {!isAdminRoute && <Header onOpenSearch={() => setSearchOpen(true)} />}

      {/* Main Page Body with PageTransition */}
      <main className="relative z-10 flex-1 w-full bg-transparent">
        <PageTransition key={currentPath}>
          {renderContent()}
        </PageTransition>
      </main>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Global Interactive Search Modal Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Customer Footer (hidden on Admin pages) */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider>
              <CartProvider>
                <WishlistProvider>
                  <MainRouter />
                </WishlistProvider>
              </CartProvider>
            </RouterProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
