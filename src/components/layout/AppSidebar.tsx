import { Home, ShoppingBag, Store, User, Search, Heart, LogIn, Menu, Smartphone, Monitor, Headphones, Gamepad2 } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useCategories } from "@/hooks/useCategories"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Marché", url: "/marketplace", icon: ShoppingBag },
  { title: "Recherche", url: "/search", icon: Search },
  { title: "Favoris", url: "/wishlist", icon: Heart },
]

const sellerItems = [
  { title: "Espace Vendeur", url: "/seller", icon: Store },
]

const accountItems = [
  { title: "Profil", url: "/profile", icon: User },
]

// Category icon mapping
const categoryIcons: Record<string, any> = {
  "Électronique": Monitor,
  "Téléphones": Smartphone,
  "Ordinateurs": Monitor,
  "Audio & Casques": Headphones,
  "Jeux": Gamepad2,
}

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user } = useAuth()
  const role = (user?.user_metadata as any)?.role as string | undefined
  const { categories } = useCategories()

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "bg-primary text-primary-foreground shadow-md" 
        : "bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-md"
    }`

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-80"}
      collapsible="icon"
    >
      <SidebarContent className="bg-background border-r">
        {/* Brand */}
        <div className={`px-4 py-6 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">LH</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Luxury Haiti
                </h1>
                <p className="text-sm text-muted-foreground">Marché Premium</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-muted-foreground font-normal text-base mb-2">
            {!collapsed && "Parcourir"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} end className={getNavCls}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories Section */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-muted-foreground font-normal text-base mb-2">
              Catégories
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <NavLink to="/marketplace" className={getNavCls}>
                    <Menu className="h-5 w-5 flex-shrink-0" />
                    <span>Toutes les catégories</span>
                  </NavLink>
                </SidebarMenuItem>
                {categories.slice(0, 5).map((category) => {
                  const IconComponent = categoryIcons[category.name] || ShoppingBag
                  return (
                    <SidebarMenuItem key={category.id}>
                      <NavLink 
                        to={`/marketplace?category=${category.id}`} 
                        className={getNavCls}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <span>{category.name}</span>
                      </NavLink>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Seller Section - Only show if authenticated and role is seller */}
        {user && role === 'seller' && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-muted-foreground font-normal text-base mb-2">
              Vendre
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                {sellerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-muted-foreground font-normal text-base mb-2">
            {!collapsed && "Compte"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {user ? (
                accountItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <NavLink to="/auth" className={getNavCls}>
                    <LogIn className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Se connecter pour vendre</span>}
                  </NavLink>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}