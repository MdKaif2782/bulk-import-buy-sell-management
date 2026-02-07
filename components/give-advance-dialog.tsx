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
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wallet,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Banknote,
} from "lucide-react"
import { useGiveAdvanceMutation } from "@/lib/store/api/employeeApi"
import { toast } from "sonner"
import type { PaymentMethod, GiveAdvanceRequest, GiveAdvanceResponse, Employee } from "@/types/employee"

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD")}`
}

// ── Success View ──

function AdvanceSuccessView({
  result,
  onClose,
}: {
  result: GiveAdvanceResponse
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold">Advance Given Successfully</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {formatCurrency(result.advance.amount)} advance given to {result.employee.name}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Previous Balance</p>
              <p className="font-semibold">{formatCurrency(result.employee.previousBalance)}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Amount Given</p>
              <p className="font-semibold text-orange-600">+{formatCurrency(result.advance.amount)}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs">New Balance</p>
              <p className="font-semibold text-red-600">{formatCurrency(result.employee.newBalance)}</p>
            </div>
          </div>
          {result.advance.reference && (
            <>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{result.advance.reference}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={onClose} className="w-full mt-4">
        Done
      </Button>
    </div>
  )
}

// ── Main Dialog ──

interface GiveAdvanceDialogProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
}

export function GiveAdvanceDialog({ isOpen, onClose, employee }: GiveAdvanceDialogProps) {
  const [giveAdvance, { isLoading }] = useGiveAdvanceMutation()

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [reference, setReference] = useState("")
  const [result, setResult] = useState<GiveAdvanceResponse | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setAmount("")
      setDescription("")
      setPaymentMethod("")
      setReference("")
      setResult(null)
      setErrors({})
    }
  }, [isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = "Amount is required"
    } else if (numAmount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !employee) return

    const data: GiveAdvanceRequest = {
      amount: parseFloat(amount),
      description: description || undefined,
      paymentMethod: paymentMethod ? (paymentMethod as PaymentMethod) : undefined,
      reference: reference || undefined,
    }

    try {
      const res = await giveAdvance({ id: employee.id, data }).unwrap()
      setResult(res)
      toast.success(`${formatCurrency(res.advance.amount)} advance given to ${res.employee.name}`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to give advance")
    }
  }

  const handleClose = () => {
    setResult(null)
    onClose()
  }

  const currentBalance = employee?.advanceBalance ?? 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Give Advance
          </DialogTitle>
          <DialogDescription>
            {employee ? `Give advance money to ${employee.name}` : "Give advance to employee"}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <AdvanceSuccessView result={result} onClose={handleClose} />
        ) : (
          <div className="space-y-4">
            {/* Current balance strip */}
            <Card>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Current Advance Balance</span>
                </div>
                <span className={`font-bold text-sm ${currentBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(currentBalance)}
                </span>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="adv-amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                  <Input
                    id="adv-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      if (errors.amount) setErrors({})
                    }}
                    placeholder="0"
                    className="pl-7"
                    min={1}
                    step="any"
                    required
                  />
                </div>
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    New balance will be: {formatCurrency(currentBalance + parseFloat(amount))}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
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
                <Label htmlFor="adv-desc">Description</Label>
                <Textarea
                  id="adv-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Emergency advance"
                  rows={2}
                />
              </div>

              {/* Reference */}
              <div className="space-y-2">
                <Label htmlFor="adv-ref">Reference / Receipt No.</Label>
                <Input
                  id="adv-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. ADV-2026-001"
                />
              </div>

              <Separator />

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !amount || parseFloat(amount) <= 0} className="gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Banknote className="h-4 w-4" />
                  )}
                  {isLoading ? "Processing..." : "Give Advance"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
