import { Heart, Mail, Phone, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">LH</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-luxury bg-clip-text text-transparent">
                  Luxury Haiti
                </h3>
                <p className="text-xs text-muted-foreground">Premium Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discover authentic Haitian crafts and premium products from talented sellers across Haiti and beyond.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>in Haiti</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link to="/search" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Search Products
              </Link>
              <Link to="/wishlist" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Wishlist
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Popular Categories</h4>
            <div className="space-y-2">
              <Link to="/marketplace?category=traditional-crafts" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Traditional Crafts
              </Link>
              <Link to="/marketplace?category=jewelry-accessories" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Jewelry & Accessories
              </Link>
              <Link to="/marketplace?category=coffee-spices" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Coffee & Spices
              </Link>
              <Link to="/marketplace?category=art-paintings" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Art & Paintings
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">hello@luxuryhaiti.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+509 xxxx-xxxx</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Port-au-Prince, Haiti</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Luxury Haiti. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}