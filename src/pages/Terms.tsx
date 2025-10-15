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
          Dernière mise à jour : Octobre 2025
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

      {/* Inscription du vendeur */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Inscription du vendeur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tout vendeur doit fournir des informations exactes et vérifiables lors de son inscription. Luxury Haiti se
            réserve le droit de refuser, suspendre ou supprimer un compte vendeur en cas d’informations inexactes,
            d’activité frauduleuse ou de non‑respect des présentes conditions.
          </p>
        </CardContent>
      </Card>

      {/* Conditions financières */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Conditions financières
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Pour chaque commande effectuée via la plateforme, Luxury Haiti applique un frais total de <span className="font-semibold">5,4%</span> du montant de la transaction. Ce pourcentage couvre les coûts liés à la gestion, au traitement et à la maintenance des paiements sur la plateforme.
          </p>
          <p className="text-muted-foreground">
            Le solde restant est automatiquement reversé au vendeur après validation de la commande. Aucun autre frais
            caché n’est appliqué.
          </p>
        </CardContent>
      </Card>

      {/* Versement des fonds */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Versement des fonds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Les paiements destinés aux vendeurs sont transférés après la confirmation de la commande par l’acheteur et la
            validation du bon déroulement de la transaction. Le délai de transfert varie généralement entre 24 et 72 heures
            ouvrées, selon le mode de paiement utilisé.
          </p>
        </CardContent>
      </Card>

      {/* Responsabilités du vendeur */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Responsabilités du vendeur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Le vendeur est entièrement responsable&nbsp;:</p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>de la conformité, qualité et authenticité des produits proposés,</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>du respect des délais de livraison,</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>et de la satisfaction du client final.</span>
            </li>
          </ul>
          <p className="text-muted-foreground">
            Luxury Haiti n’est pas responsable des litiges entre vendeurs et acheteurs, sauf en cas de dysfonctionnement
            technique avéré de la plateforme.
          </p>
        </CardContent>
      </Card>

      {/* Produits interdits */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Produits interdits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Il est strictement interdit de publier ou de vendre sur LHT&nbsp;:</p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>des produits illégaux, contrefaits, dangereux ou non conformes aux lois haïtiennes,</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>des contenus à caractère discriminatoire, pornographique, diffamatoire ou offensant.</span>
            </li>
          </ul>
          <p className="text-muted-foreground">
            Luxury Haiti se réserve le droit de supprimer immédiatement tout produit ou compte ne respectant pas ces règles.
          </p>
        </CardContent>
      </Card>

      {/* Propriété intellectuelle */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Propriété intellectuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Le vendeur conserve la propriété de ses produits, images et contenus. En publiant sur LHT, il accorde à la
            plateforme une autorisation non exclusive d’utiliser ces éléments à des fins promotionnelles (publicité,
            bannière, réseaux sociaux, etc.) dans le cadre de la mise en avant du site.
          </p>
        </CardContent>
      </Card>

      {/* Confidentialité */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Luxury Haiti s’engage à protéger les données personnelles et commerciales de ses vendeurs. Aucune information
            ne sera transmise à des tiers sans consentement, sauf en cas d’obligation légale.
          </p>
        </CardContent>
      </Card>

      {/* Résiliation */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Résiliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Luxury Haiti peut suspendre ou supprimer un compte vendeur à tout moment en cas de violation des présentes
            conditions. Le vendeur peut également demander la fermeture de son compte à tout moment via le support.
          </p>
        </CardContent>
      </Card>

      {/* Acceptation des conditions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Acceptation des conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            L’inscription et l’utilisation du compte vendeur impliquent l’acceptation complète et sans réserve des présentes
            conditions d’utilisation, y compris le frais total de <span className="font-semibold">5,4%</span> appliqué sur chaque transaction.
          </p>
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