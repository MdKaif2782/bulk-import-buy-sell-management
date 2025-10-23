"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Investor {
  id: string
  name: string
  email: string
  phone: string
  sharePercentage: number
  investmentAmount: number
  joinDate: string
  status: "active" | "inactive"
  notes: string
}

interface InvestorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (investor: Investor | Omit<Investor, "id">) => void
  investor?: Investor | null
}

export function InvestorDialog({ isOpen, onClose, onSave, investor }: InvestorDialogProps) {
  const [formData, setFormData] = useState<Omit<Investor, "id">>({
    name: "",
    email: "",
    phone: "",
    sharePercentage: 0,
    investmentAmount: 0,
    joinDate: "",
    status: "active",
    notes: "",
  })

  useEffect(() => {
    if (investor) {
      const { id, ...rest } = investor
      setFormData(rest)
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        sharePercentage: 0,
        investmentAmount: 0,
        joinDate: "",
        status: "active",
        notes: "",
      })
    }
  }, [investor, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sharePercentage" || name === "investmentAmount" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (investor) {
      onSave({ ...formData, id: investor.id } as Investor)
    } else {
      onSave(formData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{investor ? "Edit Investor" : "Add New Investor"}</DialogTitle>
          <DialogDescription>
            {investor ? "Update the investor details." : "Fill in the investor information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Investor Name</Label>
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
            <Label htmlFor="email">Email</Label>
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

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+880-1700-000000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sharePercentage">Share %</Label>
              <Input
                id="sharePercentage"
                name="sharePercentage"
                type="number"
                step="0.1"
                value={formData.sharePercentage}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="investmentAmount">Investment (৳)</Label>
              <Input
                id="investmentAmount"
                name="investmentAmount"
                type="number"
                value={formData.investmentAmount}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{investor ? "Update Investor" : "Add Investor"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
