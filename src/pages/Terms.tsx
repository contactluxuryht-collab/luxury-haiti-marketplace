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
          <h1 className="text-4xl font-bold text-foreground">Conditions d’utilisation</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Veuillez lire attentivement ces conditions avant d’utiliser nos services.
        </p>
        <Badge variant="secondary" className="text-sm">
          Dernière mise à jour : Janvier 2024
        </Badge>
      </div>

      {/* Agreement */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Acceptation des conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ces conditions d’utilisation régissent l’usage du site et des services Luxury Haiti.
            En accédant à nos services, vous acceptez d’être lié par ces conditions.
          </p>
          <p className="text-muted-foreground">
            Si vous n’acceptez pas ces conditions, n’utilisez pas nos services. Nous nous réservons le droit
            de modifier ces conditions à tout moment ; votre utilisation continue vaut acceptation des changements.
          </p>
        </CardContent>
      </Card>

      {/* Services Description */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Nos services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Luxury Haiti est une place de marché en ligne reliant acheteurs et vendeurs. Nos services incluent :
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Plateforme de vente en ligne</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Vérification et intégration des vendeurs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Traitement des paiements et gestion des commandes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Support client et gestion des litiges</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* User Accounts */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Comptes utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Création de compte</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Fournir des informations exactes et complètes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Maintenir la sécurité de votre compte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Avoir au moins 18 ans pour créer un compte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Un compte par personne ou entité</span>
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
            Usages interdits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Vous ne pouvez pas utiliser nos services à des fins illégales ni inciter à de tels actes. Les activités interdites incluent :
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Violation de lois ou réglementations en vigueur</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Transmission de code malveillant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Accès non autorisé à nos systèmes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Perturbation du bon fonctionnement des services</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Coordonnées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Pour toute question concernant ces conditions, contactez‑nous :</p>
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