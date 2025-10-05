import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useWishlist } from "@/hooks/useWishlist"
import { useCart } from "@/hooks/useCart"
import { MessageCircle } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useSettings } from "@/hooks/useSettings"

type LoadedProduct = {
  id: string
  title: string
  description: string | null
  price: number
  image_url: string | null
  category_id?: string | null
  seller_id?: string
  seller?: {
    name: string | null
    email: string
    phone_number?: string | null
  }
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<LoadedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState<LoadedProduct[]>([])
  const [extraImages, setExtraImages] = useState<string[]>([])
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment: string | null; created_at: string | null; user: { name: string | null; email: string } }>>([])
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true)
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState<string>("")
  const [soldCount, setSoldCount] = useState<number>(0)
  const [activeOffer, setActiveOffer] = useState<{ amount: number; threshold: number } | null>(null)
  const { addToWishlist, isInWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { formatPrice, t } = useSettings()

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            seller:users!products_seller_id_fkey(name, email, phone_number)
          `)
          .eq('id', id)
          .single()
        if (error) throw error
        setProduct(data as any)
        // Prefer offers table; fallback to description tag
        try {
          const nowIso = new Date().toISOString()
          const { data: offers } = await supabase
            .from('offers')
            .select('*')
            .eq('product_id', id)
            .eq('active', true)
          const valid = (offers || []).filter((o: any) => {
            const startsOk = !o.start_at || o.start_at <= nowIso
            const endsOk = !o.end_at || o.end_at >= nowIso
            return startsOk && endsOk
          })
          if (valid.length > 0) {
            setActiveOffer({ amount: Number(valid[0].amount), threshold: Number(valid[0].threshold) })
          } else {
            // Fallback: parse embedded tag
            const desc = (data as any)?.description || ''
            const mAmount = desc.match(/\[OFFER\]:[^\n]*amount\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
            const mThreshold = desc.match(/\[OFFER\]:[^\n]*threshold\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
            if (mAmount && mThreshold) {
              const amount = parseFloat(mAmount[1])
              const threshold = parseFloat(mThreshold[1])
              if (!isNaN(amount) && !isNaN(threshold)) setActiveOffer({ amount, threshold })
              else setActiveOffer(null)
            } else setActiveOffer(null)
          }
        } catch {
          setActiveOffer(null)
        }

        // Parse extra image URLs from description section "Images supplémentaires:" lines beginning with - http(s)://
        try {
          const descText = ((data as any)?.description || '') as string
          const imagesSectionMatch = descText.split(/Images supplémentaires:/i)[1]
          if (imagesSectionMatch) {
            const urls = imagesSectionMatch
              .split(/\n+/)
              .map((l) => l.replace(/^[-•]\s*/, '').trim())
              .filter((l) => /^https?:\/\//i.test(l))
          
            setExtraImages(urls)
          } else {
            setExtraImages([])
          }
        } catch {
          setExtraImages([])
        }
        // Fetch related products by category (exclude current)
        if ((data as any)?.category_id) {
          const { data: rel } = await supabase
            .from('products')
            .select(`
              *,
              seller:users!products_seller_id_fkey(name, email, phone_number)
            `)
            .eq('category_id', (data as any).category_id)
            .neq('id', id)
            .limit(4)
          setRelated((rel as any) || [])
        } else {
          setRelated([])
        }
      } catch (e) {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return
      try {
        setLoadingReviews(true)
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, rating, comment, created_at,
            user:users!reviews_user_id_fkey(name, email)
          `)
          .eq('product_id', id)
          .order('created_at', { ascending: false })
        if (error) throw error
        setReviews((data as any) || [])
      } catch (e) {
        setReviews([])
      } finally {
        setLoadingReviews(false)
      }
    }
    loadReviews()
  }, [id])

  useEffect(() => {
    const loadSold = async () => {
      if (!id) return
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('quantity')
          .eq('product_id', id)
          .eq('payment_status', 'paid')
        if (error) throw error
        const total = (data || []).reduce((sum, row) => sum + (row.quantity as any || 0), 0)
        setSoldCount(total)
      } catch {
        setSoldCount(0)
      }
    }
    loadSold()
  }, [id])

  const waLink = useMemo(() => {
    if (!product?.seller?.phone_number) return null
    const digits = product.seller.phone_number.replace(/\D/g, "")
    if (!digits) return null
    const msg = `Hi ${product.seller.name || ''}, I'm interested in your product: ${product.title}.`
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`
  }, [product])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl overflow-hidden border border-border/50 bg-gradient-card">
          {([product.image_url, ...extraImages].filter(Boolean) as string[]).length <= 1 ? (
            <img src={product.image_url || "/placeholder.svg"} alt={product.title} className="w-full h-auto" />
          ) : (
            <div className="relative p-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {([product.image_url!, ...extraImages].filter(Boolean) as string[]).map((src, idx) => (
                    <CarouselItem key={idx}>
                      <img src={src} alt={`${product.title}-${idx + 1}`} className="w-full h-96 object-contain bg-background" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-2" />
                <CarouselNext className="-right-2" />
              </Carousel>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-semibold bg-gradient-luxury bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </div>
          {activeOffer && (
            <div className="text-sm text-red-500">-{formatPrice(activeOffer.amount)} on {formatPrice(activeOffer.threshold)}</div>
          )}
        </div>
          <div className="text-sm text-muted-foreground">
            Vendeur : {product.seller?.name || 'Inconnu'}
          </div>
        <div className="text-xs text-muted-foreground">Vendus: {soldCount}</div>
          <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="luxury" onClick={() => addToCart(product.id, 1)}>{t('add_to_cart')}</Button>
            <Button variant="default" onClick={() => {
              addToCart(product.id, 1)
              navigate('/checkout')
            }}>
              Acheter maintenant
            </Button>
            <Button variant="outline" onClick={() => addToWishlist(product.id)} disabled={isInWishlist(product.id)}> 
              {isInWishlist(product.id) ? t('in_wishlist') : t('add_to_wishlist')}
            </Button>
            {waLink && (
              <Button variant="secondary" onClick={() => window.open(waLink!, '_blank')}>
                <MessageCircle className="h-4 w-4 mr-1" /> {t('whatsapp_seller')}
              </Button>
            )}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">{t('related_products')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <div key={p.id} className="border border-border/50 rounded-lg overflow-hidden bg-gradient-card">
                <img src={p.image_url || "/placeholder.svg"} alt={p.title} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-2">
                  <div className="font-medium line-clamp-1">{p.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{p.description || ''}</div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-semibold">${p.price.toLocaleString()}</div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/product/${p.id}`)}>View</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Avis</h2>
        {loadingReviews ? (
          <div className="text-muted-foreground">Chargement des avis…</div>
        ) : reviews.length === 0 ? (
          <div className="text-muted-foreground">Aucun avis pour le moment. Soyez le premier à donner votre avis.</div>
        ) : (
          <div className="space-y-3">
            {/* Average rating */}
            <div className="text-sm text-muted-foreground">
              Note moyenne : {(
                reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
              ).toFixed(1)} / 5 · {reviews.length} avis
            </div>
            {reviews.map((r) => (
              <div key={r.id} className="p-4 border border-border/50 rounded-lg bg-gradient-card">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{r.user?.name || r.user?.email || 'Anonyme'}</div>
                  <div className="text-sm">{r.rating} / 5</div>
                </div>
                {r.comment && <div className="text-sm text-muted-foreground whitespace-pre-line">{r.comment}</div>}
                {r.created_at && (
                  <div className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Review */}
      <AddReviewForm 
        productId={product.id} 
        sellerId={product.seller_id || ''} 
        defaultRating={newRating} 
        defaultComment={newComment}
        onSubmitted={async () => {
          // refresh reviews after submit
          try {
            const { data } = await supabase
              .from('reviews')
              .select(`
                id, rating, comment, created_at,
                user:users!reviews_user_id_fkey(name, email)
              `)
              .eq('product_id', product.id)
              .order('created_at', { ascending: false })
            setReviews((data as any) || [])
          } catch {}
        }}
      />
    </div>
  )
}

import { useAuth } from "@/hooks/useAuth"
import { Textarea } from "@/components/ui/textarea"

function AddReviewForm({ productId, sellerId, defaultRating, defaultComment, onSubmitted }: { productId: string; sellerId: string; defaultRating: number; defaultComment: string; onSubmitted: () => Promise<void> | void }) {
  const { user } = useAuth()
  const [rating, setRating] = useState<number>(defaultRating || 5)
  const [comment, setComment] = useState<string>(defaultComment || "")
  const [submitting, setSubmitting] = useState<boolean>(false)

  const canSubmit = !!user && rating >= 1 && rating <= 5

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      // Resolve current user's internal id
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user!.id)
        .single()
      if (userErr || !userData) throw userErr || new Error('User not found')

      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: productId,
            user_id: userData.id,
            seller_id: sellerId || null,
            rating,
            comment: comment.trim() ? comment.trim() : null,
          }
        ])
      if (error) throw error
      setComment("")
      setRating(5)
      await onSubmitted()
    } catch (e) {
      // no-op for now
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 mt-6 border border-border/50 rounded-lg p-4 bg-gradient-card">
      <div className="font-semibold">Rédiger un avis</div>
      {!user && (
        <div className="text-sm text-muted-foreground">Veuillez vous connecter pour laisser un avis.</div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Note</label>
        <select
          className="border border-border rounded-md px-2 py-1 bg-background"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          disabled={!user || submitting}
        >
          {[1,2,3,4,5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <Textarea
        placeholder="Partagez votre avis sur ce produit"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={!user || submitting}
      />
      <div>
        <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Envoi…' : 'Envoyer l’avis'}
        </Button>
      </div>
    </div>
  )
}

