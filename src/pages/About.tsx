import { Shield, Users, Package, Heart, Star, Award, Globe, Phone, Mail, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-16">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-luxury bg-clip-text text-transparent">
            About Luxury Haiti
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the beauty of Haiti through our premium marketplace, connecting you with authentic Haitian products and supporting local artisans.
          </p>
        </div>
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-lg px-6 py-2">
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            Made with love in Haiti
          </Badge>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To create a premium marketplace that showcases the exceptional craftsmanship and cultural heritage of Haiti, 
              while providing a seamless shopping experience for customers worldwide.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Support local Haitian artisans and businesses
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Promote authentic Haitian products globally
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Foster economic growth in Haiti
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To become the leading platform for Haitian luxury goods, recognized globally for quality, 
              authenticity, and cultural significance.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Global recognition of Haitian craftsmanship
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Sustainable economic impact for Haiti
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Cultural preservation and promotion
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* What We Offer */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">What We Offer</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From handcrafted jewelry to premium coffee, discover the finest products Haiti has to offer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Premium Products</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Curated selection of high-quality Haitian products including jewelry, textiles, coffee, and artisan crafts.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Verified Sellers</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                All our sellers are carefully vetted to ensure authenticity and quality. We support local Haitian businesses and artisans.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Secure Shopping</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Safe and secure transactions with buyer protection. Your satisfaction and security are our top priorities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Story */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Born from a passion for Haiti's rich culture and exceptional craftsmanship.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              Luxury Haiti was founded with a simple yet powerful vision: to showcase the incredible talent and 
              craftsmanship that exists throughout Haiti. Our founders, deeply connected to Haitian culture, 
              recognized the need for a platform that would allow these exceptional products to reach a global audience.
            </p>
            <p>
              From the bustling streets of Port-au-Prince to the artisan workshops in Cap-Haïtien, we've carefully 
              curated a collection of products that represent the very best of Haitian creativity and skill. Each item 
              tells a story of tradition, innovation, and the indomitable spirit of the Haitian people.
            </p>
            <p>
              Today, we're proud to support hundreds of local artisans and businesses, helping them reach customers 
              worldwide while preserving and promoting Haiti's rich cultural heritage. Every purchase on our platform 
              directly supports Haitian families and communities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-card rounded-2xl p-8">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-muted-foreground">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-muted-foreground">Verified Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">1,000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions or want to learn more about Luxury Haiti? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 text-center">
            <CardContent className="pt-6">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground">contactluxuryht@gmail.com</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 text-center">
            <CardContent className="pt-6">
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground">+509 33 69 61 05</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 text-center">
            <CardContent className="pt-6">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-sm text-muted-foreground">Cap-Haïtien, Haiti</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6 py-16">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Ready to Discover Luxury Haiti?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of authentic Haitian products and support local artisans.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-gradient-primary hover:opacity-90" onClick={() => window.location.assign('/marketplace')}>
            Explore Marketplace
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.location.assign('/auth')}>
            Become a Seller
          </Button>
        </div>
      </section>
    </div>
  )
}
