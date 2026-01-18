"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, FileText, Receipt, Loader2 } from "lucide-react"
import { useDownloadInvoiceMutation, useDownloadReceiptMutation } from "@/lib/store/api/retailSaleApi"
import { toast } from "sonner"
import { RetailSale } from "@/types/retailSale"

interface RetailSaleSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: RetailSale | null
}

export function RetailSaleSuccessDialog({ open, onOpenChange, sale }: RetailSaleSuccessDialogProps) {
  const [downloadInvoice, { isLoading: isDownloadingInvoice }] = useDownloadInvoiceMutation()
  const [downloadReceipt, { isLoading: isDownloadingReceipt }] = useDownloadReceiptMutation()

  const handleDownloadInvoice = async () => {
    if (!sale) return

    try {
      const blob = await downloadInvoice(sale.id).unwrap()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${sale.saleNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Invoice downloaded successfully")
    } catch (error: any) {
      console.error("Download error:", error)
      toast.error("Failed to download invoice", {
        description: error?.data?.message || "Please try again later"
      })
    }
  }

  const handleDownloadReceipt = async () => {
    if (!sale) return

    try {
      const blob = await downloadReceipt(sale.id).unwrap()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${sale.saleNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Receipt downloaded successfully")
    } catch (error: any) {
      console.error("Download error:", error)
      toast.error("Failed to download receipt", {
        description: error?.data?.message || "Please try again later"
      })
    }
  }

  const handleDownloadBoth = async () => {
    await Promise.all([handleDownloadInvoice(), handleDownloadReceipt()])
  }

  if (!sale) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Sale Completed Successfully!</DialogTitle>
              <DialogDescription>
                Sale #{sale.saleNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sale Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="font-semibold text-lg">৳{sale.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="font-medium capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Items</span>
              <span className="font-medium">{sale.items.length} item(s)</span>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Download Documents</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="gap-2"
              >
                {isDownloadingInvoice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Invoice
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                disabled={isDownloadingReceipt}
                className="gap-2"
              >
                {isDownloadingReceipt ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
                Receipt
              </Button>
            </div>

            <Button
              onClick={handleDownloadBoth}
              disabled={isDownloadingInvoice || isDownloadingReceipt}
              className="w-full gap-2"
            >
              {isDownloadingInvoice || isDownloadingReceipt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Both
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
