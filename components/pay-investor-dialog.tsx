"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  CreditCard,
  ArrowRight,
} from "lucide-react"
import { useGetInvestorDueSummaryQuery, usePayInvestorMutation } from "@/lib/store/api/investorsApi"
import { useToast } from "@/hooks/use-toast"
import type { PaymentMethod, CreateInvestorPaymentData, PaymentResponse } from "@/types/investor"

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`
}

// ── Success View ──

function PaymentSuccessView({
  result,
  onClose,
}: {
  result: PaymentResponse
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold">Payment Successful</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Payment of {formatCurrency(result.payment.amount)} to {result.investor.name} has been recorded.
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs">{result.payment.id}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-semibold text-green-600">{formatCurrency(result.payment.amount)}</span>
          </div>
          {result.payment.paymentMethod && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <Badge variant="outline" className="text-xs">
                {result.payment.paymentMethod.replace(/_/g, " ")}
              </Badge>
            </div>
          )}
          {result.payment.reference && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="text-xs font-mono">{result.payment.reference}</span>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Previous Due</p>
              <p className="font-semibold text-red-600">{formatCurrency(result.newBalance.previousDue)}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs">New Due</p>
              <p className="font-semibold text-orange-600">{formatCurrency(result.newBalance.newDue)}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Remaining Payable</p>
              <p className="font-semibold">{formatCurrency(result.newBalance.remainingPayable)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onClose} className="w-full mt-4">
        Done
      </Button>
    </div>
  )
}

// ── Main Dialog ──

interface PayInvestorDialogProps {
  isOpen: boolean
  onClose: () => void
  investorId: string | null
}

export function PayInvestorDialog({ isOpen, onClose, investorId }: PayInvestorDialogProps) {
  const { toast } = useToast()

  const { data: dueSummary, isLoading: isLoadingSummary } = useGetInvestorDueSummaryQuery(
    investorId!,
    { skip: !investorId || !isOpen }
  )

  const [payInvestor, { isLoading: isPaying }] = usePayInvestorMutation()

  // Form state
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [reference, setReference] = useState("")

  // Result state
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null)

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setAmount("")
      setDescription("")
      setPaymentMethod("")
      setReference("")
      setPaymentResult(null)
      setErrors({})
    }
  }, [isOpen])

  const payableNow = dueSummary?.summary.payableNow ?? 0
  const totalDue = dueSummary?.summary.totalDue ?? 0
  const investorName = dueSummary?.investor.name ?? ""

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const numAmount = parseFloat(amount)

    if (!amount || isNaN(numAmount)) {
      newErrors.amount = "Amount is required"
    } else if (numAmount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    } else if (numAmount > payableNow) {
      newErrors.amount = `Cannot exceed payable amount of ${formatCurrency(payableNow)}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !investorId) return

    const data: CreateInvestorPaymentData = {
      amount: parseFloat(amount),
      description: description || undefined,
      paymentMethod: paymentMethod ? (paymentMethod as PaymentMethod) : undefined,
      reference: reference || undefined,
    }

    try {
      const result = await payInvestor({ id: investorId, data }).unwrap()
      setPaymentResult(result)
      toast({
        title: "Payment Successful",
        description: `Paid ${formatCurrency(result.payment.amount)} to ${result.investor.name}`,
      })
    } catch (err: any) {
      const message = err?.data?.message || "Failed to process payment"
      toast({
        title: "Payment Failed",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setPaymentResult(null)
    onClose()
  }

  const handlePayMax = () => {
    setAmount(payableNow.toString())
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pay Investor
          </DialogTitle>
          <DialogDescription>
            {investorName ? `Process a payment to ${investorName}` : "Process investor payment"}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        {isLoadingSummary && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* Success state */}
        {paymentResult && (
          <PaymentSuccessView result={paymentResult} onClose={handleClose} />
        )}

        {/* Form state */}
        {!isLoadingSummary && !paymentResult && dueSummary && (
          <div className="space-y-4">
            {/* Balance summary strip */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Wallet className="h-4 w-4 mx-auto mb-1 text-red-600" />
                  <p className="text-xs text-muted-foreground">Total Due</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(totalDue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <DollarSign className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                  <p className="text-xs text-muted-foreground">Payable Now</p>
                  <p className="text-sm font-bold text-orange-600">{formatCurrency(payableNow)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CreditCard className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                  <p className="text-xs text-muted-foreground">Already Paid</p>
                  <p className="text-sm font-bold text-teal-600">{formatCurrency(dueSummary.summary.totalPaid)}</p>
                </CardContent>
              </Card>
            </div>

            {payableNow <= 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-medium">No payable amount available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Payments can only be made from collected sales revenue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="pay-amount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                    <Input
                      id="pay-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        if (errors.amount) setErrors((prev) => ({ ...prev, amount: "" }))
                      }}
                      placeholder="0"
                      className="pl-7"
                      min={1}
                      max={payableNow}
                      step="any"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {errors.amount ? (
                      <p className="text-xs text-destructive">{errors.amount}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Max: {formatCurrency(payableNow)}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={handlePayMax}
                    >
                      Pay Max
                    </Button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="pay-method">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="pay-description">Description</Label>
                  <Textarea
                    id="pay-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. July 2025 profit distribution"
                    rows={2}
                  />
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <Label htmlFor="pay-reference">Reference / Transaction ID</Label>
                  <Input
                    id="pay-reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. TRX-2025-123"
                  />
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isPaying}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPaying || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > payableNow}
                    className="gap-2"
                  >
                    {isPaying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    {isPaying ? "Processing..." : `Pay ${amount ? formatCurrency(parseFloat(amount) || 0) : ""}`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Error if no summary */}
        {!isLoadingSummary && !dueSummary && !paymentResult && (
          <div className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="font-medium">Could not load investor data</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
