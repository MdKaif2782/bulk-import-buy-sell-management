"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, FileText, Printer, Eye } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "@/lib/axios-instance"
import { Sidebar } from "@/components/sidebar"

interface MaterialItem {
  id: string
  itemName: string
  quantity: string
  remarks: string
}

interface Product {
  id: string
  productId: string
  name: string
  category: string
  barcode: string
  purchasePrice: number
  salePrice: number
  quantity: number
  markDeleted: boolean
}

interface Employee {
  id: string
  name: string
  department: string
  contact: string
}

interface GatePass {
  id: string
  passNumber: string
  date: string
  passType: "employee" | "visitor" | "material" | "vehicle"
  name: string
  department: string
  contactNumber: string
  purpose: string
  materialItems: MaterialItem[]
  destination: string
  expectedReturnDate: string
  requestedBy: string
  approvedBy: string
  createdAt: Date
  status: "active" | "returned" | "expired"
}

const initialGatePasses: GatePass[] = [
  {
    id: "GP001",
    passNumber: "GP-2024-001",
    date: "2024-01-15",
    passType: "material",
    name: "John Smith",
    department: "Maintenance",
    contactNumber: "+1-555-0123",
    purpose: "Equipment delivery to Site A",
    materialItems: [
      { id: "1", itemName: "Welding Machine", quantity: "1", remarks: "For repair work" },
      { id: "2", itemName: "Safety Helmets", quantity: "5", remarks: "New stock" },
    ],
    destination: "Construction Site A",
    expectedReturnDate: "2024-01-16",
    requestedBy: "Mike Johnson",
    approvedBy: "Sarah Wilson",
    createdAt: new Date("2024-01-15T10:30:00"),
    status: "active",
  },
]

export default function GatePassPage() {
  const [gatePasses, setGatePasses] = useState<GatePass[]>(initialGatePasses)
  const [isCreating, setIsCreating] = useState(false)
  const [previewPass, setPreviewPass] = useState<GatePass | null>(null)
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false)
  const [materialSearchTerm, setMaterialSearchTerm] = useState("")
  const [materialSearchResults, setMaterialSearchResults] = useState<Product[]>([])
  const [activeMaterialRowIndex, setActiveMaterialRowIndex] = useState<number | null>(null)
  const [isSearchingMaterials, setIsSearchingMaterials] = useState(false)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("")
  const [employeeSearchResults, setEmployeeSearchResults] = useState<Employee[]>([])
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false)
  const metadata = {
    company: "Invovate Inc.",
    address: "123 Gulshan 1, Dhaka, Bangladesh",
    phone: "+18807777777",
    email: "info@inovate.it.com",
    logo: "https://i.ibb.co.com/2rBB12B/Screenshot-2025-09-16-at-17-28-50.png",
    companyCategory: "Technology & Business"
  };

  // Form state
  const [formData, setFormData] = useState({
    passType: "employee" as "employee" | "visitor" | "material" | "vehicle",
    name: "",
    department: "",
    contactNumber: "",
    purpose: "",
    destination: "",
    expectedReturnDate: "",
    requestedBy: "",
    approvedBy: "",
  })

  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([
    { id: "1", itemName: "", quantity: "", remarks: "" },
  ])

  const fetchMaterials = useCallback(async (search: string) => {
    if (!search.trim()) {
      setMaterialSearchResults([])
      return
    }
    try {
      setIsSearchingMaterials(true)
      const params = new URLSearchParams()
      params.append("search", search)
      const response = await axiosInstance.get(`/products?${params.toString()}`)
      setMaterialSearchResults(response.data)
    } catch (error: any) {
      console.error("Error fetching products:", error)
      toast.error(error.response?.data?.message || "Failed to fetch products")
      setMaterialSearchResults([])
    } finally {
      setIsSearchingMaterials(false)
    }
  }, [])

  const fetchEmployees = useCallback(async (search: string) => {
    if (!search.trim()) {
      setEmployeeSearchResults([])
      return
    }
    try {
      setIsSearchingEmployees(true)
      const params = new URLSearchParams()
      params.append("query", search)
      const response = await axiosInstance.get(`/employee/search?${params.toString()}`)
      setEmployeeSearchResults(response.data.data)
    } catch (error: any) {
      console.error("Error fetching employees:", error)
      toast.error(error.response?.data?.message || "Failed to fetch employees")
      setEmployeeSearchResults([])
    } finally {
      setIsSearchingEmployees(false)
    }
  }, [])

  useEffect(() => {
    if (materialSearchTerm && activeMaterialRowIndex !== null) {
      const timer = setTimeout(() => {
        fetchMaterials(materialSearchTerm)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setMaterialSearchResults([])
    }
  }, [materialSearchTerm, activeMaterialRowIndex, fetchMaterials])

  useEffect(() => {
    if (employeeSearchTerm) {
      const timer = setTimeout(() => {
        fetchEmployees(employeeSearchTerm)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setEmployeeSearchResults([])
    }
  }, [employeeSearchTerm, fetchEmployees])

  const generatePassNumber = () => {
    const year = new Date().getFullYear()
    const nextNumber = gatePasses.length + 1
    return `GP-${year}-${String(nextNumber).padStart(3, "0")}`
  }

  const addMaterialItem = () => {
    const newItem: MaterialItem = {
      id: String(materialItems.length + 1),
      itemName: "",
      quantity: "",
      remarks: "",
    }
    setMaterialItems([...materialItems, newItem])
  }

  const removeMaterialItem = (id: string) => {
    if (materialItems.length > 1) {
      setMaterialItems(materialItems.filter((item) => item.id !== id))
    }
  }

  const updateMaterialItem = (id: string, field: keyof MaterialItem, value: string) => {
    setMaterialItems(materialItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const openMaterialDialog = (index: number) => {
    setActiveMaterialRowIndex(index)
    setMaterialSearchTerm(materialItems[index].itemName)
    setIsMaterialDialogOpen(true)
  }

  const selectMaterial = (product: Product) => {
    if (activeMaterialRowIndex === null) return
    
    const updatedItems = [...materialItems]
    updatedItems[activeMaterialRowIndex] = {
      ...updatedItems[activeMaterialRowIndex],
      itemName: product.name,
    }
    setMaterialItems(updatedItems)
    setIsMaterialDialogOpen(false)
    setMaterialSearchTerm("")
  }

  const useSearchTermAsMaterial = () => {
    if (activeMaterialRowIndex === null) return
    
    const updatedItems = [...materialItems]
    updatedItems[activeMaterialRowIndex] = {
      ...updatedItems[activeMaterialRowIndex],
      itemName: materialSearchTerm,
    }
    setMaterialItems(updatedItems)
    setIsMaterialDialogOpen(false)
    setMaterialSearchTerm("")
  }

  const openEmployeeDialog = () => {
    setEmployeeSearchTerm(formData.name)
    setIsEmployeeDialogOpen(true)
  }

  const selectEmployee = (employee: Employee) => {
    setFormData({
      ...formData,
      name: employee.name,
      department: employee.department,
      contactNumber: employee.contact,
    })
    setIsEmployeeDialogOpen(false)
    setEmployeeSearchTerm("")
  }

  const useSearchTermAsEmployee = () => {
    setFormData({
      ...formData,
      name: employeeSearchTerm,
    })
    setIsEmployeeDialogOpen(false)
    setEmployeeSearchTerm("")
  }

  const resetForm = () => {
    setFormData({
      passType: "employee",
      name: "",
      department: "",
      contactNumber: "",
      purpose: "",
      destination: "",
      expectedReturnDate: "",
      requestedBy: "",
      approvedBy: "",
    })
    setMaterialItems([{ id: "1", itemName: "", quantity: "", remarks: "" }])
    setIsCreating(false)
    setMaterialSearchTerm("")
    setMaterialSearchResults([])
    setActiveMaterialRowIndex(null)
    setIsSearchingMaterials(false)
    setIsMaterialDialogOpen(false)
    setEmployeeSearchTerm("")
    setEmployeeSearchResults([])
    setIsSearchingEmployees(false)
    setIsEmployeeDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.purpose) {
      toast.error("Please fill in required fields")
      return
    }

    const newGatePass: GatePass = {
      id: `GP${String(gatePasses.length + 1).padStart(3, "0")}`,
      passNumber: generatePassNumber(),
      date: new Date().toISOString().split("T")[0],
      ...formData,
      materialItems: formData.passType === "material" ? materialItems.filter((item) => item.itemName.trim()) : [],
      createdAt: new Date(),
      status: "active",
    }

    setGatePasses([newGatePass, ...gatePasses])
    toast.success("Gate Pass created successfully!")
    setPreviewPass(newGatePass)
    resetForm()
}

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      returned: "secondary",
      expired: "destructive",
    }
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const getPassTypeIcon = (type: string) => {
    switch (type) {
      case "employee":
        return "👤"
      case "visitor":
        return "🏢"
      case "material":
        return "📦"
      case "vehicle":
        return "🚗"
      default:
        return "📄"
    }
  }

const generatePDF = async (gatePass: GatePass) => {
  const doc = new jsPDF({ 
    orientation: "portrait", 
    unit: "mm", 
    format: "a4" 
  });

  // Metadata
  doc.setProperties({
    title: `Gate Pass ${gatePass.passNumber}`,
    subject: "Gate Pass Document",
    author: "Invovate Inc.",
    creator: "Gate Pass System"
  });

  const margin = 15;
  let yPos = margin;

  // Header: GATE PASS title (centered)
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("GATE PASS", 105, yPos, { align: "center" });
  yPos += 10;

  // Logo (left aligned)
  try {
    const logoWidth = 40;
    const logoHeight = 20;
    if (metadata.logo) {
      await addImageToPDF(doc, metadata.logo, margin+5, yPos, logoWidth, logoHeight);
    }
  } catch (err) {
    console.error("Error loading logo:", err);
  }

  // Company Info (left of logo)
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  const companyInfo = [
    `Address: ${metadata.address}`,
    `Phone: ${metadata.phone}`,
    `Email: ${metadata.email}`
  ];
  // Place info to the right of the logo with a small gap
  let infoX = margin+6.4; // 5mm gap after logo
  let infoY = yPos+=22;
  companyInfo.forEach(line => {
    doc.text(line, infoX, infoY);
    infoY += 5;
  });
  yPos = Math.max(yPos + 25, infoY + 2);
  
  // Pass Details
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("Gate Pass Details:", margin, yPos);
  yPos += 6;

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Pass No: ${gatePass.passNumber}`, margin, yPos);
  doc.text(`Date: ${gatePass.date}`, margin + 150, yPos);
  yPos += 6;

  // Pass Type
  doc.text("Pass Type:", margin, yPos);
  const passTypes = ["Employee", "Visitor", "Material", "Vehicle"];
  const boxSize = 4;
  let boxX = margin + 25;
  
  passTypes.forEach(type => {
    doc.rect(boxX, yPos - 2, boxSize, boxSize);
    if (type.toLowerCase() === gatePass.passType) {
      doc.line(boxX, yPos - 2, boxX + boxSize, yPos + 2);
      doc.line(boxX + boxSize, yPos - 2, boxX, yPos + 2);
    }
    doc.text(type, boxX + 6, yPos);
    boxX += 25;
  });
  yPos += 8;

  // Basic Information
  doc.text(`Name: ${gatePass.name}`, margin, yPos);
  doc.text(`Department/Unit: ${gatePass.department}`, margin + 80, yPos);
  yPos += 6;
  
  doc.text(`Contact Number: ${gatePass.contactNumber}`, margin, yPos);
  doc.text(`Expected Return Date: ${gatePass.expectedReturnDate || "N/A"}`, margin + 80, yPos);
  yPos += 10;

  // Purpose
  doc.setFont("times", "bold");
  doc.text("Purpose:", margin, yPos);
  yPos += 6;
  
  doc.setFont("times", "normal");
  const purposeLines = doc.splitTextToSize(gatePass.purpose, 180);
  doc.text(purposeLines, margin, yPos);
  yPos += purposeLines.length * 5 + 8;

  // Material Items Table
  if (gatePass.passType === "material" && gatePass.materialItems.length > 0) {
    doc.setFont("times", "bold");
    doc.text("Material/Item Details:", margin, yPos);
    yPos += 6;

    const tableData = gatePass.materialItems.map(item => [
      item.itemName,
      item.quantity,
      item.remarks || '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item Name/Description', 'Quantity', 'Remarks']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { 
        fontSize: 9, 
        cellPadding: 3, 
        overflow: 'linebreak' 
      },
      headStyles: { 
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25 },
        2: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  }

  // Destination
  doc.setFont("times", "bold");
  doc.text("Destination/To Be Delivered To:", margin, yPos);
  yPos += 6;
  
  doc.setFont("times", "normal");
  doc.text(gatePass.destination, margin, yPos);
  yPos += 10;

  // Approvals Section
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Approvals:", margin, yPos);
  yPos += 6;
  
  doc.setFont("times", "normal");
  doc.text(`Requested By: ${gatePass.requestedBy}`, margin, yPos);
  doc.text(`Approved By: ${gatePass.approvedBy}`, margin + 90, yPos);
  yPos += 15;
  
  doc.setDrawColor(150);
  doc.line(margin, yPos, margin + 80, yPos);
  doc.line(margin + 90, yPos, margin + 170, yPos);
  yPos += 10;

  // Security Section
  doc.setFont("times", "bold");
  doc.text("Security Use Only:", margin, yPos);
  yPos += 6;
  
  doc.setFont("times", "normal");
  doc.text("Exit Time: _________________________", margin, yPos);
  doc.text("Return Time: _________________________", margin + 90, yPos);
  yPos += 6;
  
  doc.text("Security Notes: _________________________", margin, yPos);
  yPos += 6;
  
  doc.text("Checked & Signed by Security: _________________________", margin, yPos);
  yPos += 10;

  // Footer note
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  const noteText = "Note: This pass must be shown at the gate and kept with the person/item until return/entry is complete.";
  doc.text(noteText, margin, yPos, { maxWidth: 180 });

  doc.save(`gate-pass-${gatePass.passNumber}.pdf`);
};

// Update the printGatePass function
const printGatePass = (gatePass: GatePass) => {
  generatePDF(gatePass);
  toast.success("PDF generated successfully!");
};


  return (
    <div className="flex min-h-screen bg-background">
          <Sidebar />
    <div className="ms-12 mt-12" >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gate Pass Management</h1>
          <p className="text-muted-foreground">
            Create and manage gate passes for employees, visitors, materials, and vehicles
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Create Gate Pass
        </Button>
      </div>

      {/* Create Gate Pass Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Create New Gate Pass
            </CardTitle>
            <CardDescription>Fill in the details to generate a new gate pass</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pass Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">1️⃣ Pass Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "employee", label: "Employee", icon: "👤" },
                    { value: "visitor", label: "Visitor", icon: "🏢" },
                    { value: "material", label: "Material", icon: "📦" },
                    { value: "vehicle", label: "Vehicle", icon: "🚗" },
                  ].map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={formData.passType === type.value}
                        onCheckedChange={() => setFormData({ ...formData, passType: type.value as any })}
                      />
                      <Label htmlFor={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">2️⃣ Name *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                    {formData.passType === "employee" && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={openEmployeeDialog}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">3️⃣ Department/Unit</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department or unit"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">4️⃣ Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedReturnDate">8️⃣ Expected Return Date</Label>
                  <Input
                    id="expectedReturnDate"
                    type="date"
                    value={formData.expectedReturnDate}
                    onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">5️⃣ Purpose *</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Enter purpose of visit/exit"
                  required
                />
              </div>

              {/* Material Items (only for material pass type) */}
              {formData.passType === "material" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">6️⃣ Material/Item Details</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMaterialItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name/Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex gap-2">
                                <Input
                                  value={item.itemName}
                                  onChange={(e) => updateMaterialItem(item.id, "itemName", e.target.value)}
                                  placeholder="Item name/description"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openMaterialDialog(index)}
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.quantity}
                                onChange={(e) => updateMaterialItem(item.id, "quantity", e.target.value)}
                                placeholder="Qty"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.remarks}
                                onChange={(e) => updateMaterialItem(item.id, "remarks", e.target.value)}
                                placeholder="Remarks"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterialItem(item.id)}
                                disabled={materialItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="destination">7️⃣ Destination/To Be Delivered To</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Enter destination"
                />
              </div>

              {/* Approvals */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="requestedBy">9️⃣ Requested By</Label>
                  <Input
                    id="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                    placeholder="Name of requester"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Input
                    id="approvedBy"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                    placeholder="Name of approver"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Gate Pass
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Material Search Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Product</DialogTitle>
            <DialogDescription>
              Search for products to add as material items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  placeholder="Search products..."
                  value={materialSearchTerm}
                  onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => fetchMaterials(materialSearchTerm)}
                disabled={isSearchingMaterials}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {isSearchingMaterials ? (
              <div className="p-4 text-center">Searching products...</div>
            ) : materialSearchResults.length > 0 ? (
              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {materialSearchResults.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectMaterial(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">ID: {product.productId}</div>
                    <div className="text-sm">Category: {product.category}</div>
                  </div>
                ))}
              </div>
            ) : materialSearchTerm ? (
              <div className="text-center p-4 border rounded-md">
                <p className="mb-2">No products found for "{materialSearchTerm}"</p>
                <Button onClick={useSearchTermAsMaterial}>
                  Use "{materialSearchTerm}" as item description
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <p>Enter a product name to search</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Search Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select an Employee</DialogTitle>
            <DialogDescription>
              Search for employees to fill in details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  placeholder="Search employees..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => fetchEmployees(employeeSearchTerm)}
                disabled={isSearchingEmployees}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {isSearchingEmployees ? (
              <div className="p-4 text-center">Searching employees...</div>
            ) : employeeSearchResults.length > 0 ? (
              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {employeeSearchResults.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectEmployee(employee)}
                  >
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">Department: {employee.department}</div>
                    <div className="text-sm">Contact: {employee.contact}</div>
                  </div>
                ))}
              </div>
            ) : employeeSearchTerm ? (
              <div className="text-center p-4 border rounded-md">
                <p className="mb-2">No employees found for "{employeeSearchTerm}"</p>
                <Button onClick={useSearchTermAsEmployee}>
                  Use "{employeeSearchTerm}" as name
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <p>Enter an employee name to search</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Gate Pass Preview/Print */}
      {previewPass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Gate Pass Preview
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => printGatePass(previewPass)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print PDF
                </Button>
                <Button variant="outline" onClick={() => setPreviewPass(null)}>
                  Close
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="max-w-4xl mx-auto bg-white text-black p-8 border-2 border-gray-300"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {/* Header */}
              <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                <h1 className="text-2xl font-bold">🧾 GATE PASS</h1>
                <div className="mt-2">
                  <h2 className="text-xl font-semibold">[Company Name & Logo]</h2>
                  <h3 className="text-lg">Engineering Company</h3>
                  <p>Address: ______________________</p>
                  <p>Phone: ____________</p>
                </div>
                <div className="flex justify-between mt-4">
                  <p>
                    <strong>Pass No:</strong> {previewPass.passNumber}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(previewPass.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Pass Type */}
              <div className="mb-4">
                <p className="font-semibold mb-2">1️⃣ Pass Type (Tick one):</p>
                <div className="flex space-x-6">
                  <span>[{previewPass.passType === "employee" ? "✓" : " "}] Employee</span>
                  <span>[{previewPass.passType === "visitor" ? "✓" : " "}] Visitor</span>
                  <span>[{previewPass.passType === "material" ? "✓" : " "}] Material</span>
                  <span>[{previewPass.passType === "vehicle" ? "✓" : " "}] Vehicle</span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p>
                    <strong>2️⃣ Name:</strong> {previewPass.name}
                  </p>
                  <p>
                    <strong>3️⃣ Department/Unit:</strong> {previewPass.department}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>4️⃣ Contact Number:</strong> {previewPass.contactNumber}
                  </p>
                  <p>
                    <strong>8️⃣ Expected Return Date:</strong>{" "}
                    {previewPass.expectedReturnDate
                      ? new Date(previewPass.expectedReturnDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p>
                  <strong>5️⃣ Purpose:</strong> {previewPass.purpose}
                </p>
              </div>

              {/* Material Items */}
              {previewPass.passType === "material" && previewPass.materialItems.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">6️⃣ Material/Item Details:</p>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Item Name/Description</th>
                        <th className="border border-gray-300 p-2 text-left">Quantity</th>
                        <th className="border border-gray-300 p-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewPass.materialItems.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{item.itemName}</td>
                          <td className="border border-gray-300 p-2">{item.quantity}</td>
                          <td className="border border-gray-300 p-2">{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mb-4">
                <p>
                  <strong>7️⃣ Destination/To Be Delivered To:</strong> {previewPass.destination}
                </p>
              </div>

              {/* Approvals */}
              <div className="mb-6">
                <p className="font-semibold mb-2">9️⃣ Approvals:</p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p>Requested By (Sign): {previewPass.requestedBy}</p>
                    <div className="border-b border-gray-300 mt-8 mb-2"></div>
                  </div>
                  <div>
                    <p>Approved By (Sign): {previewPass.approvedBy}</p>
                    <div className="border-b border-gray-300 mt-8 mb-2"></div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="border-t-2 border-gray-300 pt-4">
                <p className="font-semibold mb-2">🔐 Security Use Only</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p>Exit Time: ____________</p>
                    <p>Return Time (if applicable): ____________</p>
                  </div>
                  <div>
                    <p>Security Notes: _________________________</p>
                    <p>Checked & Signed by Security: _________________________</p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-6 text-sm text-center italic">
                <p>
                  <strong>Note:</strong> This pass must be shown at the gate and kept with the person/item until
                  return/entry is complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gate Pass List */}
      <Card>
        <CardHeader>
          <CardTitle>Gate Pass Records</CardTitle>
          <CardDescription>All created gate passes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pass Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gatePasses.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-medium">{pass.passNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{getPassTypeIcon(pass.passType)}</span>
                      <span className="capitalize">{pass.passType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{pass.name}</TableCell>
                  <TableCell className="max-w-xs truncate" title={pass.purpose}>
                    {pass.purpose}
                  </TableCell>
                  <TableCell>{new Date(pass.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(pass.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewPass(pass)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => printGatePass(pass)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}


const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const addImageToPDF = (doc: jsPDF, imgData: string, x: number, y: number, width: number, height: number) => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      doc.addImage(img, 'PNG', x, y, width, height);
      resolve();
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};