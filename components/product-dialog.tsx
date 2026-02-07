// components/inventory-dialog.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Inventory, UpdateInventoryRequest } from "@/types/inventory"
import { uploadImageToCloudinary } from "@/lib/store/api/baseApi"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface InventoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateInventoryRequest) => void
  inventory?: Inventory | null
  isLoading?: boolean
}

export function InventoryDialog({ isOpen, onClose, onSave, inventory, isLoading = false }: InventoryDialogProps) {
  const [formData, setFormData] = useState<UpdateInventoryRequest>({
    productName: "",
    description: "",
    expectedSalePrice: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    barcode: "",
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inventory) {
      setFormData({
        productName: inventory.productName,
        description: inventory.description || "",
        expectedSalePrice: inventory.expectedSalePrice,
        minStockLevel: inventory.minStockLevel || 0,
        maxStockLevel: inventory.maxStockLevel || 0,
        barcode: inventory.barcode || "",
        imageUrl: inventory.imageUrl || "",
      })
      setImagePreview(inventory.imageUrl || null)
      setImageFile(null)
    } else {
      setFormData({
        productName: "",
        description: "",
        expectedSalePrice: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        barcode: "",
        imageUrl: "",
      })
      setImagePreview(null)
      setImageFile(null)
    }
  }, [inventory, isOpen])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productName" || name === "description" || name === "barcode" ? value : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalImageUrl = formData.imageUrl

    if (imageFile) {
      setIsUploading(true)
      try {
        finalImageUrl = await uploadImageToCloudinary(imageFile)
        toast.success("Image uploaded successfully")
      } catch (error) {
        toast.error("Failed to upload image. Please try again.")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    onSave({ ...formData, imageUrl: finalImageUrl || undefined })
  }

  const isBusy = isLoading || isUploading

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{inventory ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {inventory
              ? "Update the product details below."
              : "Fill in the product information to add it to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div>
            <Label>Product Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg border overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm">Click to upload image</span>
                  <span className="text-xs">PNG, JPG up to 5MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Cotton Fabric Roll"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="e.g., 123456789012"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedSalePrice">Expected Sale Price (৳)</Label>
              <Input
                id="expectedSalePrice"
                name="expectedSalePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.expectedSalePrice}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxStockLevel">Max Stock Level</Label>
            <Input
              id="maxStockLevel"
              name="maxStockLevel"
              type="number"
              min="0"
              value={formData.maxStockLevel}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : isLoading ? (
                "Saving..."
              ) : inventory ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}