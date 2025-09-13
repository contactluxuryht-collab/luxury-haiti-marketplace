export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>
      
      <div className="flex items-center justify-center h-64 bg-gradient-card rounded-xl border border-border/50">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connect to Supabase for Authentication</h3>
          <p className="text-muted-foreground">Enable user profiles and account management</p>  
        </div>
      </div>
    </div>
  )
}