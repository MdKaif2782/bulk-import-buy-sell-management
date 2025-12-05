'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatePurchaseOrderData, PaymentType, CreatePurchaseOrderItem, CreatePurchaseOrderInvestment } from '@/types/purchaseOrder';
import { toast } from 'sonner';
import { X, Plus, Loader2, Phone } from 'lucide-react';
import { Investor } from '@/types/investor';

const COUNTRIES = [
  'Bangladesh',
  'China',
  'India',
  'USA',
  'UK',
  'Germany',
  'Japan',
  'South Korea',
  'Vietnam',
  'Thailand'
].sort();

interface CreatePurchaseOrderProps {
  onSuccess: (newOrder: CreatePurchaseOrderData) => void;
  investors: Investor[];
  isLoading?: boolean;
}

export function CreatePurchaseOrder({ onSuccess, investors, isLoading = false }: CreatePurchaseOrderProps) {
  const [vendor, setVendor] = useState({
    name: '',
    country: '',
    address: '',
    contact: '', // Contact person name
    contactNo: '', // Contact phone number
  });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [products, setProducts] = useState<CreatePurchaseOrderItem[]>([
    { productName: '', description: '', quantity: 1, unitPrice: 0, taxPercentage: 0, totalPrice: 0 }
  ]);
  const [selectedInvestors, setSelectedInvestors] = useState<CreatePurchaseOrderInvestment[]>([]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.DUE);
  const [notes, setNotes] = useState('');

  // Calculate totals without causing re-renders
  const calculateProductTotal = useCallback((product: CreatePurchaseOrderItem) => {
    return product.quantity * product.unitPrice * (1 + product.taxPercentage / 100);
  }, []);

  const subtotal = products.reduce((sum, product) => sum + calculateProductTotal(product), 0);
  const taxAmount = applyTax ? (subtotal * taxPercentage) / 100 : 0;
  const totalAmount = subtotal + taxAmount;
  const dueAmount = paymentType === PaymentType.DUE ? totalAmount : 0;

  const addProduct = () => {
    setProducts([
      ...products,
      { productName: '', description: '', quantity: 1, unitPrice: 0, taxPercentage: 0, totalPrice: 0 }
    ]);
  };

  const updateProduct = (index: number, field: keyof CreatePurchaseOrderItem, value: string | number) => {
    const updatedProducts = [...products];
    const product = updatedProducts[index];
    
    if (field === 'productName' || field === 'description') {
      product[field] = value as string;
    } else {
      product[field] = Number(value);
    }
    
    // Calculate total price for this product only
    product.totalPrice = calculateProductTotal(product);
    
    setProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const addInvestor = (investorId: string) => {
    const investor = investors.find(inv => inv.id === investorId);
    if (investor && !selectedInvestors.find(inv => inv.investorId === investorId)) {
      setSelectedInvestors([...selectedInvestors, { 
        investorId,
        investmentAmount: 0,
        profitPercentage: 0,
        isFullInvestment: false
      }]);
    }
  };

  const updateInvestor = (investorId: string, field: keyof CreatePurchaseOrderInvestment, value: number | boolean) => {
    setSelectedInvestors(selectedInvestors.map(inv => {
      if (inv.investorId === investorId) {
        return { ...inv, [field]: value };
      }
      return inv;
    }));
  };

  const removeInvestor = (investorId: string) => {
    setSelectedInvestors(selectedInvestors.filter(inv => inv.investorId !== investorId));
  };

  const handleSubmit = () => {
    // Validation
    if (!vendor.name || !vendor.country || !vendor.contact || !vendor.contactNo) {
      toast.error('Please fill in all required vendor fields');
      return;
    }

    if (products.some(p => !p.productName || p.quantity <= 0 || p.unitPrice <= 0)) {
      toast.error('Please fill all product details correctly');
      return;
    }

    // Validate contact number format (basic validation)
    const phoneRegex = /^[0-9\-\+\s\(\)]{10,15}$/;
    if (!phoneRegex.test(vendor.contactNo.replace(/\s/g, ''))) {
      toast.error('Please enter a valid contact number');
      return;
    }

    // Validate investments don't exceed total amount
    const totalInvestment = selectedInvestors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    if (totalInvestment > totalAmount) {
      toast.error('Total investment cannot exceed purchase order total amount');
      return;
    }

    // Create purchase order data with calculated totals
    const purchaseOrderData: CreatePurchaseOrderData = {
      vendorName: vendor.name,
      vendorCountry: vendor.country,
      vendorAddress: vendor.address,
      vendorContact: vendor.contact, // Contact person name
      vendorContactNo: vendor.contactNo, // Contact phone number
      paymentType,
      totalAmount,
      taxAmount,
      dueAmount,
      notes: notes || undefined,
      items: products.map(product => ({
        ...product,
        totalPrice: calculateProductTotal(product)
      })),
      investments: selectedInvestors,
    };

    onSuccess(purchaseOrderData);
  };

  const totalInvestment = selectedInvestors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const remainingAmount = totalAmount - totalInvestment;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Purchase Order</h2>
      </div>

      {/* Vendor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorName">Company Name *</Label>
              <Input 
                id="vendorName" 
                placeholder="Enter company name" 
                value={vendor.name}
                onChange={(e) => setVendor(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="vendorCountry">Country *</Label>
              <Select
                value={vendor.country}
                onValueChange={(value) => setVendor(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vendorContact">Contact Person *</Label>
              <Input 
                id="vendorContact" 
                placeholder="Contact person name" 
                value={vendor.contact}
                onChange={(e) => setVendor(prev => ({ ...prev, contact: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="vendorContactNo">Contact Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="vendorContactNo" 
                  placeholder="+880 1234 567890"
                  className="pl-10"
                  value={vendor.contactNo}
                  onChange={(e) => setVendor(prev => ({ ...prev, contactNo: e.target.value }))}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Format: +880 1234 567890 or 01234567890
              </p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="vendorAddress">Address</Label>
              <Input 
                id="vendorAddress" 
                placeholder="Full address" 
                value={vendor.address}
                onChange={(e) => setVendor(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg">
                <div className="col-span-4">
                  <Label>Product Name *</Label>
                  <Input
                    value={product.productName}
                    onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price (BDT) *</Label>
                  <Input
                    type="number"
                    value={product.unitPrice}
                    onChange={(e) => updateProduct(index, 'unitPrice', Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Total</Label>
                  <div className="text-sm font-medium p-2 bg-muted rounded">
                    {formatCurrency(calculateProductTotal(product))}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(index)}
                    disabled={products.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="col-span-12">
                  <Label>Description</Label>
                  <Input
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    placeholder="Product description (optional)"
                  />
                </div>
              </div>
            ))}
            
            <Button type="button" onClick={addProduct} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investors */}
      <Card>
        <CardHeader>
          <CardTitle>Investors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Add Investor</Label>
              <Select onValueChange={addInvestor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select investor" />
                </SelectTrigger>
                <SelectContent>
                  {investors.filter(inv => inv.isActive).map(investor => (
                    <SelectItem key={investor.id} value={investor.id}>
                      {investor.name} - {investor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedInvestors.length > 0 && (
            <div className="space-y-4">
              {selectedInvestors.map(investment => {
                const investor = investors.find(inv => inv.id === investment.investorId);
                return (
                  <div key={investment.investorId} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Investor</Label>
                      <Input value={investor?.name || ''} disabled />
                    </div>
                    <div>
                      <Label>Investment Amount (BDT)</Label>
                      <Input
                        type="number"
                        value={investment.investmentAmount}
                        onChange={(e) => updateInvestor(investment.investorId, 'investmentAmount', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        max={remainingAmount + investment.investmentAmount}
                      />
                    </div>
                    <div>
                      <Label>Profit Share (%)</Label>
                      <Input
                        type="number"
                        value={investment.profitPercentage}
                        onChange={(e) => updateInvestor(investment.investorId, 'profitPercentage', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`full-investment-${investment.investorId}`}
                        checked={investment.isFullInvestment}
                        onCheckedChange={(checked) => 
                          updateInvestor(investment.investorId, 'isFullInvestment', checked as boolean)
                        }
                      />
                      <Label htmlFor={`full-investment-${investment.investorId}`} className="text-sm">
                        Full Investment
                      </Label>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeInvestor(investment.investorId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {/* Investment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm">Total Investment</Label>
                  <div className="font-bold">{formatCurrency(totalInvestment)}</div>
                </div>
                <div>
                  <Label className="text-sm">Remaining Amount</Label>
                  <div className={`font-bold ${remainingAmount >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {formatCurrency(remainingAmount)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Investors</Label>
                  <div className="font-bold">{selectedInvestors.length}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={(value: PaymentType) => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentType.FULL}>Full Payment</SelectItem>
                  <SelectItem value={PaymentType.DUE}>Due Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Apply Tax to Entire Order</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="applyTax"
                  checked={applyTax}
                  onCheckedChange={(checked) => setApplyTax(checked as boolean)}
                />
                <Label htmlFor="applyTax" className="text-sm">
                  Apply {taxPercentage}% tax to subtotal
                </Label>
              </div>
            </div>
          </div>

          {applyTax && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tax Percentage (%)</Label>
                <Input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or instructions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {applyTax && (
              <div className="flex justify-between">
                <span>Tax ({taxPercentage}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            {selectedInvestors.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Investor Funding:</span>
                  <span>{formatCurrency(totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining (Self Funded):</span>
                  <span>{formatCurrency(remainingAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-primary border-t pt-2">
              <span>Payment Type:</span>
              <span>{paymentType === PaymentType.FULL ? 'Full Payment' : 'Due Payment'}</span>
            </div>
            {paymentType === PaymentType.DUE && (
              <div className="flex justify-between font-bold text-destructive border-t pt-2">
                <span>Amount Due:</span>
                <span>{formatCurrency(dueAmount)}</span>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-6" 
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !vendor.name || !vendor.country || !vendor.contact || !vendor.contactNo || products.some(p => !p.productName || p.quantity <= 0 || p.unitPrice <= 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Purchase Order...
              </>
            ) : (
              'Create Purchase Order'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}