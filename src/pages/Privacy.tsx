import { Shield, Eye, Lock, Database, Users, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Your privacy is important to us. Learn how we collect, use, and protect your information.
        </p>
        <Badge variant="secondary" className="text-sm">
          Last updated: January 2024
        </Badge>
      </div>

      {/* Introduction */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Introduction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Luxury Haiti ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our website 
            and services.
          </p>
          <p className="text-muted-foreground">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our services.
          </p>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Name, email address, and phone number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Billing and shipping addresses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Payment information (processed securely through third-party providers)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Account preferences and settings</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Usage Information</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Pages visited and time spent on our website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Products viewed and purchased</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Device information and browser type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>IP address and location data</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Information */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Service Provision</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Process orders and payments</li>
                <li>• Provide customer support</li>
                <li>• Manage your account</li>
                <li>• Communicate about your orders</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Improvement & Marketing</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Improve our services</li>
                <li>• Send promotional emails (with consent)</li>
                <li>• Analyze usage patterns</li>
                <li>• Personalize your experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal information against unauthorized 
            access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>SSL encryption for data transmission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Secure servers and databases</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Regular security audits and updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Limited access to personal information</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
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