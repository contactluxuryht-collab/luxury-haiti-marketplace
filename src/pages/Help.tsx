import { HelpCircle, Search, MessageCircle, Phone, Mail, Clock, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export default function Help() {
  const faqs = [
    {
      question: "Comment créer un compte ?",
      answer: "Cliquez sur ‘S’inscrire’ en haut à droite, remplissez vos informations et choisissez acheteur ou vendeur. Les vendeurs doivent fournir des informations d’entreprise."
    },
    {
      question: "Comment devenir vendeur ?",
      answer: "Inscrivez‑vous en tant que vendeur et fournissez vos informations d’entreprise. Votre compte sera examiné et approuvé sous 24–48 heures. Ensuite, vous pourrez publier des produits."
    },
    {
      question: "Quels moyens de paiement acceptez‑vous ?",
      answer: "Nous acceptons les principales cartes, PayPal et virements. Les paiements sont traités en toute sécurité par nos partenaires."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Selon le vendeur et la destination : en Haïti 2–5 jours ouvrables, à l’international 7–14 jours."
    },
    {
      question: "Puis‑je retourner un produit ?",
      answer: "Les politiques de retour varient selon le vendeur. Consultez la page produit ou contactez le vendeur. La plupart des produits bénéficient d’une garantie de satisfaction de 30 jours."
    },
    {
      question: "Comment suivre ma commande ?",
      answer: "À l’expédition, vous recevez un numéro de suivi par e‑mail. Vous pouvez aussi voir le statut depuis votre espace compte."
    },
    {
      question: "Que faire en cas de problème avec ma commande ?",
      answer: "Contactez d’abord le vendeur via la messagerie. Si nécessaire, notre support : contactluxuryht@gmail.com ou +509 33 69 61 05."
    },
    {
      question: "Tous les produits sont‑ils authentiques ?",
      answer: "Oui, nous n’autorisons que des produits authentiques. Les vendeurs sont vérifiés et les contrefaçons strictement interdites."
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Support e‑mail",
      description: "Obtenez de l’aide par e‑mail",
      contact: "contactluxuryht@gmail.com",
      response: "Réponse sous 24 heures"
    },
    {
      icon: Phone,
      title: "Support téléphonique",
      description: "Appelez‑nous directement",
      contact: "+509 33 69 61 05",
      response: "Lun‑Ven, 9h–18h"
    },
    {
      icon: MessageCircle,
      title: "Chat en direct",
      description: "Discutez avec notre équipe",
      contact: "Disponible sur le site",
      response: "Lun‑Ven, 9h–18h"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6 py-12">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold text-foreground">Centre d’aide</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Trouvez des réponses à vos questions, obtenez de l’aide et découvrez comment profiter au mieux de Luxury Haiti.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Recherchez des articles d’aide, FAQ ou sujets…"
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Help Categories */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-foreground">Aide rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Premiers pas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Nouveau sur Luxury Haiti ? Découvrez comment créer un compte, parcourir et acheter.</p>
              <Button variant="outline" className="w-full">
                En savoir plus
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Compte et commandes</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Gérez votre compte, suivez les commandes, mettez à jour les paiements et retours.</p>
              <Button variant="outline" className="w-full">
                En savoir plus
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Vendre sur Luxury Haiti</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Tout savoir pour devenir vendeur et gérer votre boutique.</p>
              <Button variant="outline" className="w-full">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Questions fréquentes</h2>
          <p className="text-muted-foreground">Trouvez des réponses rapides aux questions les plus courantes.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact Support */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Contacter le support</h2>
          <p className="text-muted-foreground">Besoin d’aide ? Notre équipe est là pour vous.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <p className="font-medium text-foreground mb-2">{method.contact}</p>
                  <Badge variant="secondary" className="text-xs">
                    {method.response}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Contacter maintenant
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Business Hours */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horaires du support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Support client</h3>
              <p className="text-muted-foreground">Lundi – Vendredi : 9h00 – 18h00</p>
              <p className="text-muted-foreground">Samedi : 10h00 – 16h00</p>
              <p className="text-muted-foreground">Dimanche : fermé</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Support d’urgence</h3>
              <p className="text-muted-foreground">Pour les urgences hors horaires, écrivez‑nous et nous répondrons dès que possible.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Ressources supplémentaires</h2>
          <p className="text-muted-foreground">Découvrez d’autres moyens d’obtenir de l’aide et d’en savoir plus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Règles de la communauté</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Nos standards communautaires et les bonnes pratiques.</p>
              <Button variant="outline">Lire les règles</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Tutoriels vidéo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Guides vidéo pas à pas pour bien utiliser Luxury Haiti.</p>
              <Button variant="outline">Voir les vidéos</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}