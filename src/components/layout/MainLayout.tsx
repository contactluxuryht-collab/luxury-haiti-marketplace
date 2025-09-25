import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Footer } from "./Footer"
import { Button } from "@/components/ui/button"
import { Bell, Home, LogOut, Search, Shield, ShoppingBag, Heart, User, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { NavLink, useNavigate } from "react-router-dom"
import { useSettings } from "@/hooks/useSettings"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { currency, setCurrency, t } = useSettings()

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-3">
              {/* Desktop sidebar trigger */}
              <div className="hidden md:block">
                <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground" />
              </div>
              {/* Mobile menu (drawer) */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">LH</span>
                        </div>
                        <div>
                          <h1 className="text-base font-bold bg-gradient-luxury bg-clip-text text-transparent">Luxury Haiti</h1>
                          <p className="text-xs text-muted-foreground">Marché Premium</p>
                        </div>
                      </div>
                    </div>
                    <nav className="p-2 space-y-1">
                      <MobileNavLink to="/" icon={Home} label="Accueil" />
                      <MobileNavLink to="/marketplace" icon={ShoppingBag} label="Marché" />
                      <MobileNavLink to="/search" icon={Search} label="Recherche" />
                      <MobileNavLink to="/wishlist" icon={Heart} label="Favoris" />
                      <MobileNavLink to="/profile" icon={User} label="Profil" />
                      {(user?.user_metadata as any)?.role === 'seller' && (
                        <MobileNavLink to="/seller" icon={ShoppingBag} label="Espace Vendeur" />
                      )}
                      {(user?.user_metadata as any)?.role === 'admin' && (
                        <MobileNavLink to="/admin" icon={Shield} label="Admin" />
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground">{t('welcome')}</h2>
                <p className="hidden md:block text-sm text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Currency Selector */}
              <select
                className="h-9 px-2 border border-border rounded-md bg-background text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                <option value="HTG">HTG</option>
                <option value="USD">USD</option>
              </select>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
              </Button>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {(user.user_metadata as any)?.role === 'admin' && (
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Se connecter pour vendre
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/admin/login")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Connexion Admin
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />

          {/* Mobile bottom navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="grid grid-cols-5 h-14">
              <BottomNavLink to="/" icon={Home} label="Accueil" />
              <BottomNavLink to="/marketplace" icon={ShoppingBag} label="Marché" />
              <BottomNavLink to="/search" icon={Search} label="Recherche" />
              <BottomNavLink to="/wishlist" icon={Heart} label="Favoris" />
              <BottomNavLink to="/profile" icon={User} label="Profil" />
            </div>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  )
}

function MobileNavLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  )
}

function BottomNavLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
      }
    >
      <Icon className="h-5 w-5 mb-0.5" />
      <span>{label}</span>
    </NavLink>
  )
}