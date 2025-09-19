import { FileText, Scale, Users, AlertTriangle, Shield, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Please read these terms carefully before using our services.
        </p>
        <Badge variant="secondary" className="text-sm">
          Last updated: January 2024
        </Badge>
      </div>

      {/* Agreement */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Agreement to Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            These Terms of Service ("Terms") govern your use of the Luxury Haiti website and services. 
            By accessing or using our services, you agree to be bound by these Terms.
          </p>
          <p className="text-muted-foreground">
            If you do not agree to these Terms, please do not use our services. We reserve the right to 
            modify these Terms at any time, and your continued use constitutes acceptance of any changes.
          </p>
        </CardContent>
      </Card>

      {/* Services Description */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Our Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Luxury Haiti is an online marketplace that connects buyers with sellers of authentic Haitian products. 
            Our services include:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Online marketplace platform for Haitian products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Seller verification and onboarding services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Payment processing and order management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Customer support and dispute resolution</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* User Accounts */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Account Creation</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You must provide accurate and complete information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You are responsible for maintaining account security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You must be at least 18 years old to create an account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>One account per person or business entity</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited Uses */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Prohibited Uses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You may not use our services for any unlawful purpose or to solicit others to perform unlawful acts. 
            Prohibited activities include:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Violating any applicable laws or regulations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Transmitting harmful or malicious code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Attempting to gain unauthorized access to our systems</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Interfering with the proper functioning of our services</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">contactluxuryht@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">+509 33 69 61 05</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}