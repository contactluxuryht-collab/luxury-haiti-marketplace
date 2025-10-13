import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const roleField = (formData.get('role') as 'buyer' | 'seller') || role
    const businessName = formData.get('businessName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const sellingFocus = formData.get('sellingFocus') as string

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name,
            role: roleField,
            businessName: roleField === 'seller' ? businessName : undefined,
            phoneNumber: roleField === 'seller' ? phoneNumber : undefined,
            sellingFocus: roleField === 'seller' ? sellingFocus : undefined
          }
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(error.message)
        }
      } else {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        })
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(error.message)
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">LH</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">
            Luxury Haiti
          </h1>
          <p className="text-muted-foreground mt-2">Rejoignez notre marché premium</p>
        </div>

        <Card className="border-border/50 shadow-luxury">
          <CardHeader className="text-center">
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte ou créez-en un nouveau pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">S'inscrire</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4 border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre mot de passe"
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Type de compte</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={role === 'buyer' ? 'default' : 'outline'}
                        onClick={() => setRole('buyer')}
                        className="w-full"
                      >
                        Acheteur
                      </Button>
                      <Button
                        type="button"
                        variant={role === 'seller' ? 'default' : 'outline'}
                        onClick={() => setRole('seller')}
                        className="w-full"
                      >
                        Vendeur
                      </Button>
                    </div>
                    <input type="hidden" name="role" value={role} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Votre nom complet"
                      required
                      disabled={loading}
                    />
                  </div>
                  {role === 'seller' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-business-name">Nom de l'entreprise</Label>
                    <Input
                      id="signup-business-name"
                      name="businessName"
                      type="text"
                      placeholder="Nom de votre entreprise"
                      required={role === 'seller'}
                      disabled={loading}
                    />
                  </div>
                  )}
                  {role === 'seller' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Numéro de téléphone</Label>
                    <Input
                      id="signup-phone"
                      name="phoneNumber"
                      type="tel"
                      placeholder="ex. +509 1234 5678"
                      required={role === 'seller'}
                      disabled={loading}
                    />
                  </div>
                  )}
                  {role === 'seller' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-selling">Que voulez-vous vendre ?</Label>
                    <Input
                      id="signup-selling"
                      name="sellingFocus"
                      type="text"
                      placeholder="ex. Mode, Électronique, Maison & Décoration"
                      required={role === 'seller'}
                      disabled={loading}
                    />
                  </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Créez un mot de passe"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Le mot de passe doit contenir au moins 6 caractères
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer un compte
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}