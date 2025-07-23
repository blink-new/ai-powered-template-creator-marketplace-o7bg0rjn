import React, { useState } from 'react'
import { CreditCard, Lock, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { blink } from '../../blink/client'
import { Template } from '../../types/template'

interface PaymentModalProps {
  template: Template | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ template, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  })

  const handlePayment = async () => {
    if (!template) return
    
    try {
      setProcessing(true)
      const user = await blink.auth.me()
      
      // For demo purposes, we'll simulate a successful payment
      // In a real app, you'd integrate with Stripe's payment processing
      
      // Create purchase record
      const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await blink.db.purchases.create({
        id: purchaseId,
        buyerUserId: user.id,
        sellerUserId: template.userId,
        templateId: template.id,
        amount: template.price || 0,
        status: 'completed',
        createdAt: new Date().toISOString()
      })
      
      // Update template sales count
      await blink.db.templates.update(template.id, {
        salesCount: (template.salesCount || 0) + 1
      })
      
      // Create user template record for access
      await blink.db.userTemplates.create({
        id: `${user.id}_${template.id}`,
        userId: user.id,
        templateId: template.id,
        isOwner: false,
        createdAt: new Date().toISOString()
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleFreeDownload = async () => {
    if (!template) return
    
    try {
      setProcessing(true)
      const user = await blink.auth.me()
      
      // Create user template record for free access
      await blink.db.userTemplates.create({
        id: `${user.id}_${template.id}`,
        userId: user.id,
        templateId: template.id,
        isOwner: false,
        createdAt: new Date().toISOString()
      })
      
      // Update template download count
      await blink.db.templates.update(template.id, {
        salesCount: (template.salesCount || 0) + 1
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!template) return null

  const isFree = template.price === 0
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isFree ? 'Download Template' : 'Purchase Template'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Info */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-xl">
                {template.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{template.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
                <span className="font-semibold text-indigo-600">
                  {formatPrice(template.price || 0)}
                </span>
              </div>
            </div>
          </div>

          {isFree ? (
            /* Free Download */
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Free Template</h4>
                <p className="text-sm text-green-700">
                  This template is available for free download. Click below to add it to your collection.
                </p>
              </div>
              
              <Button 
                onClick={handleFreeDownload} 
                disabled={processing}
                className="w-full"
              >
                {processing ? 'Processing...' : 'Download Free Template'}
              </Button>
            </div>
          ) : (
            /* Payment Form */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={paymentForm.email}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">{formatPrice(template.price || 0)}</span>
                </div>
                
                <Button 
                  onClick={handlePayment} 
                  disabled={processing}
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {processing ? 'Processing Payment...' : `Pay ${formatPrice(template.price || 0)}`}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                By completing this purchase, you agree to our terms of service and privacy policy.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}