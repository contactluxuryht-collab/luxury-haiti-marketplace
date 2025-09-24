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
          <h1 className="text-4xl font-bold text-foreground">Politique de confidentialité</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Votre vie privée est importante pour nous. Découvrez comment nous collectons, utilisons et protégeons vos informations.
        </p>
        <Badge variant="secondary" className="text-sm">
          Dernière mise à jour : Janvier 2024
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
            Luxury Haiti (« nous », « notre ») s’engage à protéger votre vie privée. Cette politique explique comment
            nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre site et nos services.
          </p>
          <p className="text-muted-foreground">
            En utilisant nos services, vous acceptez la collecte et l’utilisation de vos informations conformément à cette politique.
            Si vous n’êtes pas d’accord, veuillez ne pas utiliser nos services.
          </p>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Informations que nous collectons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Informations personnelles</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Nom, adresse e‑mail et numéro de téléphone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Adresses de facturation et de livraison</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Informations de paiement (traitées en toute sécurité par des prestataires tiers)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Préférences et paramètres de compte</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Informations d’utilisation</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Pages visitées et temps passé sur le site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Produits consultés et achetés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Informations sur l’appareil et le navigateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Adresse IP et données de localisation</span>
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
            Comment nous utilisons vos informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Fourniture de services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Traiter les commandes et les paiements</li>
                <li>• Assurer l’assistance client</li>
                <li>• Gérer votre compte</li>
                <li>• Communiquer au sujet de vos commandes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Amélioration et marketing</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Améliorer nos services</li>
                <li>• Envoyer des e‑mails promotionnels (avec consentement)</li>
                <li>• Analyser les usages</li>
                <li>• Personnaliser votre expérience</li>
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
            Sécurité des données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre l’accès non autorisé,
            l’altération, la divulgation ou la destruction. Ces mesures incluent :
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Chiffrement SSL pour la transmission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Serveurs et bases de données sécurisés</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Audits de sécurité et mises à jour réguliers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Accès limité aux informations personnelles</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Nous contacter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Pour toute question sur cette politique ou nos pratiques de données, contactez‑nous :</p>
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