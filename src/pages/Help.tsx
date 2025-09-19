import { HelpCircle, Search, MessageCircle, Phone, Mail, Clock, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export default function Help() {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner, fill in your information, and choose whether you want to be a buyer or seller. For sellers, you'll need to provide additional business information."
    },
    {
      question: "How do I become a seller?",
      answer: "Sign up as a seller and provide your business information. Your account will be reviewed by our admin team, and you'll receive approval within 24-48 hours. Once approved, you can start listing products."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners."
    },
    {
      question: "How long does shipping take?",
      answer: "Shipping times vary by seller and location. Most domestic orders within Haiti take 2-5 business days, while international orders can take 7-14 business days."
    },
    {
      question: "Can I return a product?",
      answer: "Return policies vary by seller. Check the individual product page for return information, or contact the seller directly. We also have a 30-day satisfaction guarantee on most products."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account dashboard."
    },
    {
      question: "What if I have a problem with my order?",
      answer: "Contact the seller first through our messaging system. If you can't resolve the issue, contact our customer support team at contactluxuryht@gmail.com or +509 33 69 61 05."
    },
    {
      question: "Are all products authentic Haitian products?",
      answer: "Yes, we only allow authentic Haitian products on our platform. All sellers are verified, and we have strict policies against counterfeit or non-Haitian products."
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "contactluxuryht@gmail.com",
      response: "Response within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly",
      contact: "+509 33 69 61 05",
      response: "Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available on website",
      response: "Mon-Fri, 9AM-6PM EST"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6 py-12">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold text-foreground">Help Center</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find answers to your questions, get support, and learn how to make the most of Luxury Haiti.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Help Categories */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-foreground">Quick Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                New to Luxury Haiti? Learn how to create an account, browse products, and make your first purchase.
              </p>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Account & Orders</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Manage your account, track orders, update payment methods, and handle returns.
              </p>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Selling on Luxury Haiti</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Everything you need to know about becoming a seller and managing your store.
              </p>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Find quick answers to the most common questions about Luxury Haiti.
          </p>
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
          <h2 className="text-3xl font-bold text-foreground">Contact Support</h2>
          <p className="text-muted-foreground">
            Still need help? Our support team is here to assist you.
          </p>
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
                  Contact Now
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
            Support Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Customer Support</h3>
              <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
              <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM EST</p>
              <p className="text-muted-foreground">Sunday: Closed</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Emergency Support</h3>
              <p className="text-muted-foreground">For urgent issues outside business hours, please email us and we'll respond as soon as possible.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Additional Resources</h2>
          <p className="text-muted-foreground">
            Explore more ways to get help and learn about Luxury Haiti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Learn about our community standards and how to be a good member of the Luxury Haiti community.
              </p>
              <Button variant="outline">Read Guidelines</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Watch step-by-step video guides on how to use Luxury Haiti effectively.
              </p>
              <Button variant="outline">Watch Videos</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}