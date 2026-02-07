"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Banknote,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Wallet,
  AlertTriangle,
  Receipt,
  Calculator,
} from "lucide-react"
import { format } from "date-fns"
import {
  useGetSalaryPreviewQuery,
  usePaySalaryMutation,
} from "@/lib/store/api/employeeApi"
import { toast } from "sonner"
import type {
  PaymentMethod,
  PaySalaryResponse,
  Salary,
  Employee,
} from "@/types/employee"

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Success View ──

function PaySalarySuccessView({
  result,
  onClose,
}: {
  result: PaySalaryResponse
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold">Salary Paid Successfully</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {formatCurrency(result.payment.netPaid)} paid to {result.employee.name}
        </p>
      </div>

      {/* Payment breakdown */}
      <Card className="w-full text-left">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Salary</span>
            <span className="font-medium">{formatCurrency(result.payment.grossSalary)}</span>
          </div>
          {result.payment.advanceDeducted > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Advance Deducted</span>
              <span className="font-medium text-orange-600">-{formatCurrency(result.payment.advanceDeducted)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Net Paid</span>
            <span className="text-green-600">{formatCurrency(result.payment.netPaid)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Advance recovery info */}
      {result.advanceDeduction.deducted > 0 && (
        <Card className="w-full text-left">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <Wallet className="h-4 w-4" /> Advance Recovery
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="font-semibold text-red-600">{formatCurrency(result.advanceDeduction.previousBalance)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Deducted</p>
                <p className="font-semibold text-orange-600">-{formatCurrency(result.advanceDeduction.deducted)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">New Balance</p>
                <p className={`font-semibold ${result.advanceDeduction.newBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(result.advanceDeduction.newBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result.payment.reference && (
        <div className="flex justify-between text-sm w-full px-1">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono text-xs">{result.payment.reference}</span>
        </div>
      )}

      <Button onClick={onClose} className="w-full mt-4">
        Done
      </Button>
    </div>
  )
}

// ── Main Dialog ──

interface PaySalaryDialogProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  /** If paying from unpaid list, pass the salary record */
  salary?: Salary | null
}

export function PaySalaryDialog({
  isOpen,
  onClose,
  employee,
  salary,
}: PaySalaryDialogProps) {
  const now = new Date()
  const salaryMonth = salary?.month ?? now.getMonth() + 1
  const salaryYear = salary?.year ?? now.getFullYear()

  const {
    data: preview,
    isLoading: isLoadingPreview,
    error: previewError,
  } = useGetSalaryPreviewQuery(
    { id: employee?.id ?? "", month: salaryMonth, year: salaryYear },
    { skip: !employee || !isOpen }
  )

  const [paySalary, { isLoading: isPaying }] = usePaySalaryMutation()

  // Form state
  const [advanceDeduction, setAdvanceDeduction] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [paidDate, setPaidDate] = useState(format(now, "yyyy-MM-dd"))
  const [result, setResult] = useState<PaySalaryResponse | null>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setAdvanceDeduction(0)
      setPaymentMethod("")
      setReference("")
      setNotes("")
      setPaidDate(format(new Date(), "yyyy-MM-dd"))
      setResult(null)
    }
  }, [isOpen])

  // Auto-fill suggested deduction when preview loads
  useEffect(() => {
    if (preview?.advance) {
      setAdvanceDeduction(preview.advance.suggestedDeduction)
    }
  }, [preview])

  const grossSalary = preview?.salary?.grossSalary ?? salary?.grossSalary ?? 0
  const maxDeduction = preview?.advance?.maxDeduction ?? 0
  const netSalary = grossSalary - advanceDeduction

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    const paidDateISO = new Date(paidDate + "T00:00:00.000Z").toISOString()

    try {
      const res = await paySalary({
        employeeId: employee.id,
        month: salaryMonth,
        year: salaryYear,
        paidDate: paidDateISO,
        advanceDeduction: advanceDeduction > 0 ? advanceDeduction : undefined,
        paymentMethod: paymentMethod ? (paymentMethod as PaymentMethod) : undefined,
        reference: reference || undefined,
        notes: notes || undefined,
      }).unwrap()

      setResult(res)
      toast.success(`Salary paid: ${formatCurrency(res.payment.netPaid)} to ${res.employee.name}`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to pay salary")
    }
  }

  const handleClose = () => {
    setResult(null)
    onClose()
  }

  const monthName = preview?.salary?.monthName
    ?? format(new Date(salaryYear, salaryMonth - 1), "MMMM yyyy")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Pay Salary
          </DialogTitle>
          <DialogDescription>
            {employee ? `${employee.name} — ${monthName}` : "Process salary payment"}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <PaySalarySuccessView result={result} onClose={handleClose} />
        ) : isLoadingPreview ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : previewError ? (
          <div className="text-center py-8 space-y-2">
            <AlertTriangle className="h-10 w-10 mx-auto text-destructive" />
            <p className="text-destructive font-medium">Failed to load salary preview</p>
            <p className="text-sm text-muted-foreground">
              Please try again or check if a salary record exists for this period.
            </p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Salary Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Calculator className="h-4 w-4" />
                  Salary Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span>{formatCurrency(preview?.salary?.baseSalary ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allowances</span>
                  <span>{formatCurrency(preview?.salary?.allowances ?? 0)}</span>
                </div>
                {(preview?.salary?.overtimeAmount ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Overtime ({preview?.salary?.overtimeHours ?? 0}h)
                    </span>
                    <span>{formatCurrency(preview?.salary?.overtimeAmount ?? 0)}</span>
                  </div>
                )}
                {(preview?.salary?.bonus ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bonus</span>
                    <span className="text-green-600">+{formatCurrency(preview?.salary?.bonus ?? 0)}</span>
                  </div>
                )}
                {(preview?.salary?.deductions ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductions</span>
                    <span className="text-red-600">-{formatCurrency(preview?.salary?.deductions ?? 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(grossSalary)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Advance Deduction */}
            {preview && preview.advance.currentBalance > 0 && (
              <Card className="border-orange-200 dark:border-orange-900/40">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Advance Deduction</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Balance: {formatCurrency(preview.advance.currentBalance)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <Label htmlFor="adv-deduct">Deduct from salary</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Max: {formatCurrency(maxDeduction)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => setAdvanceDeduction(maxDeduction)}
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[advanceDeduction]}
                      onValueChange={([v]) => setAdvanceDeduction(v)}
                      max={maxDeduction}
                      step={100}
                      className="my-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">৳</span>
                      <Input
                        id="adv-deduct"
                        type="number"
                        value={advanceDeduction}
                        onChange={(e) => {
                          const val = Math.min(parseFloat(e.target.value) || 0, maxDeduction)
                          setAdvanceDeduction(Math.max(0, val))
                        }}
                        min={0}
                        max={maxDeduction}
                        step="any"
                        className="h-8"
                      />
                    </div>
                  </div>

                  {advanceDeduction > 0 && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      After deduction: advance balance will be{" "}
                      <span className="font-medium">
                        {formatCurrency(preview.advance.currentBalance - advanceDeduction)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Net Pay */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="font-medium text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Net Pay
                </span>
                <span className="text-xl font-bold text-primary">{formatCurrency(netSalary)}</span>
              </CardContent>
            </Card>

            {/* Payment details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pay-date">Payment Date *</Label>
                <Input
                  id="pay-date"
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-ref">Reference</Label>
              <Input
                id="pay-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. SAL-2026-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-notes">Notes</Label>
              <Textarea
                id="pay-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>

            <Separator />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPaying}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPaying} className="gap-2">
                {isPaying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Banknote className="h-4 w-4" />
                )}
                {isPaying ? "Processing..." : `Pay ${formatCurrency(netSalary)}`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
