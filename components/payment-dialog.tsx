"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import {
  InvestorPayable,
  CreateInvestorPaymentData,
  PaymentMethod,
} from "@/types/investor"

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (paymentData: CreateInvestorPaymentData) => void
  payable?: InvestorPayable
  investorName: string
  isLoading: boolean
  maxAmount?: number
}

export function PaymentDialog({
  isOpen,
  onClose,
  onSave,
  payable,
  investorName,
  isLoading,
  maxAmount
}: PaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER)
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (payable && isOpen) {
      setAmount(payable.remainingAmount.toString())
    } else if (isOpen) {
      setAmount("")
    }
  }, [payable, isOpen])

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setAmount("")
      setPaymentMethod(PaymentMethod.BANK_TRANSFER)
      setReference("")
      setNotes("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const paymentAmount = parseFloat(amount)
    
    if (maxAmount && paymentAmount > maxAmount) {
      alert(`Payment amount cannot exceed ৳ ${maxAmount.toLocaleString()}`)
      return
    }

    if (paymentAmount <= 0) {
      alert("Payment amount must be greater than 0")
      return
    }

    onSave({
      amount: paymentAmount,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
      payableId: payable?.id
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Make Payment to {investorName}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              max={maxAmount}
              step="0.01"
              required
            />
            {maxAmount && (
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ৳ {maxAmount.toLocaleString()}
              </p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
              <option value={PaymentMethod.CARD}>Card</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Reference (Optional)</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment notes"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Make Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}