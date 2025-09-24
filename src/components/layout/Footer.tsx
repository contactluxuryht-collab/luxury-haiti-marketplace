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
                <p className="text-xs text-muted-foreground">Marché Premium</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Un marché moderne pour tout trouver : mode, électronique, maison et plus encore.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>en Haïti</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Liens rapides</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Marché
              </Link>
              <Link to="/search" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Rechercher des produits
              </Link>
              <Link to="/wishlist" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Favoris
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Catégories populaires</h4>
            <div className="space-y-2">
              <Link to="/marketplace?category=electronics" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Électronique
              </Link>
              <Link to="/marketplace?category=phones-accessories" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Téléphones & Accessoires
              </Link>
              <Link to="/marketplace?category=computers-laptops" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Ordinateurs & Portables
              </Link>
              <Link to="/marketplace?category=audio-headphones" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Audio & Casques
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Nous contacter</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">contactluxuryht@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+509 33 69 61 05</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cap‑Haïtien, Haïti</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Luxury Haiti. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Conditions d’utilisation
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Centre d’aide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}