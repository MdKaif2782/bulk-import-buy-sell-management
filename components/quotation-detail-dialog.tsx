import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Building, Calendar, Package, DollarSign, Download, Printer, Mail, User, FileSignature, CheckCircle, XCircle, Clock, Send, Tag, Hash, Package2, FileCheck, FileX, CalendarDays, MapPin, Phone, Mail as MailIcon, Globe } from "lucide-react"
import { Quotation } from "@/types/quotation"
import { JSX, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

// Company Information
const COMPANY_INFO = {
  name: "Genuine Stationers & Gift Corner",
  address: "169/C Kalabagan (Old), 94/1 Green Road (New) Staff Colony",
  address2: "Kalabagan 2nd Lane, Dhanmondi, Dhaka- 1205",
  phone: "+88-02-9114774",
  mobile: "+88 01711-560963, +88 01971-560963",
  email: "gsgcreza@gmail.com, gmsreza87@yahoo.com"
}

interface QuotationDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  quotation: Quotation | null
  getStatusBadge: (status: string) => JSX.Element
}

export function QuotationDetailsDialog({ 
  isOpen, 
  onClose, 
  quotation, 
  getStatusBadge 
}: QuotationDetailsDialogProps) {
  const { toast } = useToast()

  if (!quotation) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const calculateItemTotal = (item: typeof quotation.items[0]) => {
    return item.quantity * item.unitPrice
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />
      case 'EXPIRED': return <Clock className="w-4 h-4 text-orange-600" />
      case 'SENT': return <Send className="w-4 h-4 text-blue-600" />
      case 'CANCELLED': return <FileX className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const handleDownloadPdf = () => {
    const pdfUrl = `https://genuine.inovate.it.com/api/quotations/${quotation.id}/pdf`;
    window.open(pdfUrl, '_blank');
    toast({
      title: "Opening PDF",
      description: "Quotation PDF will open in a new tab.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-h-[95vh] !max-w-[90vw] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="w-6 h-6" />
                Quotation - {quotation.quotationNumber}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Created: {formatDateTime(quotation.createdAt)}
                </span>
                {quotation.validUntil && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Valid until: {formatDate(quotation.validUntil)}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(quotation.status)}
              <Button 
                onClick={handleDownloadPdf}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Header */}
          <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-900">{COMPANY_INFO.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{COMPANY_INFO.address}</p>
              <p className="text-sm text-gray-600">{COMPANY_INFO.address2}</p>
              <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {COMPANY_INFO.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {COMPANY_INFO.mobile}
                </span>
                <span className="flex items-center gap-1">
                  <MailIcon className="w-3 h-3" />
                  {COMPANY_INFO.email}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Company Info */}
            <div className="space-y-6">
              {/* Quotation Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="w-5 h-5" />
                    Quotation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Quotation Number</label>
                    <p className="text-lg font-semibold">{quotation.quotationNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(quotation.status)}
                      <span className="font-medium capitalize">{quotation.status.toLowerCase()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Created Date</label>
                    <p className="text-sm">{formatDateTime(quotation.createdAt)}</p>
                  </div>
                  {quotation.validUntil && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Valid Until</label>
                      <p className="text-sm">{formatDate(quotation.validUntil)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                    <p className="text-sm font-medium">{quotation.companyName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Address</label>
                    <p className="text-sm whitespace-pre-line">{quotation.companyAddress}</p>
                  </div>
                  {quotation.contactPersonName && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Contact Person</label>
                      <p className="text-sm flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {quotation.contactPersonName}
                      </p>
                    </div>
                  )}
                  {quotation.companyContact && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Contact</label>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {quotation.companyContact}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              {(quotation.deliveryTerms || quotation.deliveryDays) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package2 className="w-5 h-5" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quotation.deliveryTerms && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Delivery Terms</label>
                        <p className="text-sm">{quotation.deliveryTerms}</p>
                      </div>
                    )}
                    {quotation.deliveryDays && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Delivery Days</label>
                        <p className="text-sm">{quotation.deliveryDays} days</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject */}
              {quotation.subject && (
                <Card>
                  <CardContent className="p-6">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Subject</label>
                      <p className="text-base font-medium">{quotation.subject}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5" />
                    Quotation Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left font-semibold">SL</th>
                          <th className="p-3 text-left font-semibold">Description</th>
                          <th className="p-3 text-left font-semibold">Code</th>
                          <th className="p-3 text-left font-semibold">Qty</th>
                          <th className="p-3 text-left font-semibold">Unit Price</th>
                          <th className="p-3 text-left font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.items.map((item, index) => {
                          const itemTotal = calculateItemTotal(item)
                          return (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{index + 1}</td>
                              <td className="p-3">
                                <div className="flex items-start gap-3">
                                  {item.inventory?.imageUrl && (
                                    <img 
                                      src={item.inventory.imageUrl} 
                                      alt={item.inventory.productName}
                                      className="w-12 h-12 object-cover rounded border"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{item.inventory?.productName || "N/A"}</p>
                                    {item.inventory?.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.inventory.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-sm">
                                {item.inventory?.productCode || "N/A"}
                              </td>
                              <td className="p-3">{item.quantity}</td>
                              <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                              <td className="p-3 font-semibold">{formatCurrency(itemTotal)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 border-t pt-4">
                    <div className="ml-auto max-w-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(quotation.items.reduce((sum, item) => sum + calculateItemTotal(item), 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax:</span>
                        <span className="font-medium">{formatCurrency(quotation.taxAmount || 0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Grand Total:</span>
                        <span className="text-blue-700">{formatCurrency(quotation.totalAmount)}</span>
                      </div>
                      {quotation.moneyInWords && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800">Amount in Words:</p>
                          <p className="text-sm italic text-blue-700 mt-1">{quotation.moneyInWords}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              {(quotation.generalTerms || quotation.paymentTerms) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileCheck className="w-5 h-5" />
                      Terms & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quotation.paymentTerms && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Payment Terms</h4>
                        <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-line text-sm">
                          {quotation.paymentTerms}
                        </div>
                      </div>
                    )}
                    {quotation.generalTerms && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">General Terms</h4>
                        <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-line text-sm">
                          {quotation.generalTerms}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Purchase Order Information */}
              {quotation.buyerPO && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      Purchase Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                        <p className="text-lg font-semibold text-green-700">{quotation.buyerPO.poNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">PO Date</label>
                        <p className="text-sm">{formatDate(quotation.buyerPO.poDate)}</p>
                      </div>
                      {quotation.buyerPO.pdfUrl && (
                        <div className="md:col-span-2">
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => window.open(quotation.buyerPO!.pdfUrl!, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                            View PO PDF
                          </Button>
                        </div>
                      )}
                      {quotation.buyerPO.externalUrl && (
                        <div className="md:col-span-2">
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => window.open(quotation.buyerPO!.externalUrl!, '_blank')}
                          >
                            <Globe className="w-4 h-4" />
                            View External Link
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}