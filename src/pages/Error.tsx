import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, RefreshCw } from "lucide-react"

export default function Error() {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/marketplace')
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md text-center shadow-xl border-2">
        <CardHeader className="space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-base">
            We encountered an issue processing your payment.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Don't worry, no charges have been made to your account. You can try again or contact support if the problem persists.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={() => navigate('/checkout')} 
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/marketplace')} 
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Continue Shopping
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
