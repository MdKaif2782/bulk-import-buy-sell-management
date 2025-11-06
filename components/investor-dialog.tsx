"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Investor as ApiInvestor } from "@/types/investor"

interface InvestorFormData {
  name: string
  email: string
  phone: string
  address: string
  taxId: string
  bankAccount: string
  bankName: string
  isActive: boolean
}

interface InvestorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (investor: InvestorFormData) => void
  investor?: ApiInvestor | null
  isLoading?: boolean
}

export function InvestorDialog({ isOpen, onClose, onSave, investor, isLoading = false }: InvestorDialogProps) {
  const [formData, setFormData] = useState<InvestorFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    bankAccount: "",
    bankName: "",
    isActive: true,
  })

  useEffect(() => {
    if (investor) {
      setFormData({
        name: investor.name || "",
        email: investor.email || "",
        phone: investor.phone || "",
        address: investor.address || "",
        taxId: investor.taxId || "",
        bankAccount: investor.bankAccount || "",
        bankName: investor.bankName || "",
        isActive: investor.isActive ?? true,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        taxId: "",
        bankAccount: "",
        bankName: "",
        isActive: true,
      })
    }
  }, [investor, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{investor ? "Edit Investor" : "Add New Investor"}</DialogTitle>
          <DialogDescription>
            {investor ? "Update the investor details." : "Fill in the investor information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Investor Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Investor A"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="investor@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880-1700-000000"
                required
              />
            </div>

            <div>
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="Tax identification number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input
                id="bankAccount"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="Bank account number"
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Bank name"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="text-sm font-medium leading-none">
              Active Investor
            </Label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {investor ? "Updating..." : "Creating..."}
                </>
              ) : (
                investor ? "Update Investor" : "Add Investor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}