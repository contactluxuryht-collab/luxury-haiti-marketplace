import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function Success() {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/marketplace')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md text-center shadow-xl border-2">
        <CardHeader className="space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-base">
            Your payment has been completed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Thank you for your purchase. You will be redirected to the marketplace shortly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={() => navigate('/marketplace')} 
              className="flex-1"
              size="lg"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => navigate('/profile')} 
              variant="outline"
              className="flex-1"
              size="lg"
            >
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
