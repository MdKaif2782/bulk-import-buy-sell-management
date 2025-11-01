// app/purchase-order/components/create-purchase-order.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, Investor, Vendor, PurchaseOrder } from '@/types';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

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

const MOCK_INVESTORS = [
  { id: '1', name: 'Mr. Zaman', totalInvestment: 500000, currentBalance: 300000 },
  { id: '2', name: 'Ms. Rahman', totalInvestment: 300000, currentBalance: 150000 },
  { id: '3', name: 'Mr. Hossain', totalInvestment: 200000, currentBalance: 100000 },
];

const MOCK_VENDORS: Vendor[] = [
  {
    id: '1',
    name: 'ABC Electronics',
    country: 'China',
    contact: 'Zhang Wei',
    address: '123 Tech Street, Shenzhen',
    email: 'contact@abcelectronics.com',
    phone: '+86-123-4567'
  },
  {
    id: '2',
    name: 'Dhaka Textiles',
    country: 'Bangladesh',
    contact: 'Ali Ahmed',
    address: '456 Textile Road, Dhaka',
    email: 'info@dhakatextiles.com',
    phone: '+880-123-4567'
  }
];

interface CreatePurchaseOrderProps {
  onSuccess: (newOrder: Omit<PurchaseOrder, 'id'>) => void;
}

export function CreatePurchaseOrder({ onSuccess }: CreatePurchaseOrderProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState<Omit<Vendor, 'id'>>({
    name: '',
    country: '',
    contact: '',
    address: '',
    email: '',
    phone: ''
  });
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash' | 'card' | 'mobile banking'>('bank');
  const [paymentReference, setPaymentReference] = useState('');

  const subtotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
  const taxAmount = applyTax ? (subtotal * taxPercentage) / 100 : 0;
  const totalAmount = subtotal + taxAmount;
  const amountDue = totalAmount - amountPaid;

  const addProduct = () => {
    setProducts([
      ...products,
      { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]);
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = [...products];
    const product = updatedProducts[index];
    
    if (field === 'name') {
      product.name = value as string;
    } else if (field === 'quantity' || field === 'unitPrice') {
      product[field] = Number(value);
      product.totalPrice = product.quantity * product.unitPrice;
    }
    
    setProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const addInvestor = (investorId: string) => {
    const investor = MOCK_INVESTORS.find(inv => inv.id === investorId);
    if (investor && !investors.find(inv => inv.id === investorId)) {
      setInvestors([...investors, { 
        ...investor,
        investmentAmount: 0,
        profitShare: 0,
        amountPaid: 0,
        amountDue: 0,
        payments: []
      }]);
    }
  };

  const updateInvestor = (investorId: string, field: string, value: number) => {
    setInvestors(investors.map(inv => {
      if (inv.id === investorId) {
        const updated = { ...inv, [field]: value };
        
        // Calculate due amount
        if (field === 'investmentAmount' || field === 'amountPaid') {
          updated.amountDue = updated.investmentAmount - updated.amountPaid;
        }
        
        return updated;
      }
      return inv;
    }));
  };

  const removeInvestor = (investorId: string) => {
    setInvestors(investors.filter(inv => inv.id !== investorId));
  };

  const handleNewVendorChange = (field: keyof Vendor, value: string) => {
    setNewVendor(prev => ({ ...prev, [field]: value }));
  };

  const saveNewVendor = () => {
    if (!newVendor.name || !newVendor.country || !newVendor.contact) {
      toast.error('Please fill in all required vendor fields');
      return;
    }

    const vendor: Vendor = {
      ...newVendor,
      id: `vendor-${Date.now()}`
    };

    setVendor(vendor);
    setShowVendorForm(false);
    setNewVendor({
      name: '',
      country: '',
      contact: '',
      address: '',
      email: '',
      phone: ''
    });
    
    toast.success('Vendor added successfully');
  };

  const handleSubmit = () => {
    // Validation
    if (!vendor) {
      toast.error('Please select a vendor');
      return;
    }

    if (products.some(p => !p.name || p.quantity <= 0 || p.unitPrice <= 0)) {
      toast.error('Please fill all product details correctly');
      return;
    }

    // Create purchase order data
    const purchaseOrderData: Omit<PurchaseOrder, 'id'> = {
      vendor,
      products: products.map(p => ({
        ...p,
        totalPrice: p.quantity * p.unitPrice
      })),
      investors: investors.filter(inv => inv.investmentAmount > 0),
      taxPercentage: applyTax ? taxPercentage : 0,
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid,
      amountDue,
      orderDate: new Date(),
      status: 'pending',
      paymentMethod,
      paymentReference,
      payments: []
    };

    toast.success('Purchase order created successfully!');
    onSuccess(purchaseOrderData);
  };

  const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const totalPaid = investors.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalDue = investors.reduce((sum, inv) => sum + inv.amountDue, 0);

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

      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor">Select Vendor</Label>
              <Select 
                value={vendor?.id} 
                onValueChange={(value) => {
                  const selectedVendor = MOCK_VENDORS.find(v => v.id === value);
                  setVendor(selectedVendor || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose vendor" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_VENDORS.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name} - {vendor.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowVendorForm(!showVendorForm)}
            >
              {showVendorForm ? 'Cancel' : 'Add New Vendor'}
            </Button>
          </div>

          {showVendorForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="vendorName">Company Name *</Label>
                <Input 
                  id="vendorName" 
                  placeholder="Enter company name" 
                  value={newVendor.name}
                  onChange={(e) => handleNewVendorChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vendorCountry">Country *</Label>
                <Select
                  value={newVendor.country}
                  onValueChange={(value) => handleNewVendorChange('country', value)}
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
                  placeholder="Contact name" 
                  value={newVendor.contact}
                  onChange={(e) => handleNewVendorChange('contact', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vendorPhone">Phone</Label>
                <Input 
                  id="vendorPhone" 
                  placeholder="Phone number" 
                  value={newVendor.phone}
                  onChange={(e) => handleNewVendorChange('phone', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="vendorAddress">Address</Label>
                <Input 
                  id="vendorAddress" 
                  placeholder="Full address" 
                  value={newVendor.address}
                  onChange={(e) => handleNewVendorChange('address', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="vendorEmail">Email</Label>
                <Input 
                  id="vendorEmail" 
                  type="email"
                  placeholder="Email address" 
                  value={newVendor.email}
                  onChange={(e) => handleNewVendorChange('email', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={saveNewVendor} className="w-full">
                  Save Vendor
                </Button>
              </div>
            </div>
          )}

          {vendor && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">Selected Vendor: {vendor.name}</div>
              <div className="text-sm text-muted-foreground">
                {vendor.contact} • {vendor.country}
              </div>
            </div>
          )}
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
              <div key={product.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Label>Product Name *</Label>
                  <Input
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price (BDT) *</Label>
                  <Input
                    type="number"
                    value={product.unitPrice}
                    onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Total (BDT)</Label>
                  <Input
                    value={formatCurrency(product.totalPrice)}
                    disabled
                    className="bg-muted"
                  />
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
                  {MOCK_INVESTORS.map(investor => (
                    <SelectItem key={investor.id} value={investor.id}>
                      {investor.name} - Balance: {formatCurrency(investor.currentBalance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {investors.length > 0 && (
            <Tabs defaultValue="investment" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="investment">Investment Details</TabsTrigger>
                <TabsTrigger value="payment">Payment Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="investment">
                <div className="space-y-4">
                  {investors.map(investor => (
                    <div key={investor.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Investor</Label>
                        <Input value={investor.name} disabled />
                      </div>
                      <div>
                        <Label>Investment Amount (BDT)</Label>
                        <Input
                          type="number"
                          value={investor.investmentAmount}
                          onChange={(e) => updateInvestor(investor.id, 'investmentAmount', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          max={MOCK_INVESTORS.find(i => i.id === investor.id)?.currentBalance}
                        />
                      </div>
                      <div>
                        <Label>Profit Share (%)</Label>
                        <Input
                          type="number"
                          value={investor.profitShare}
                          onChange={(e) => updateInvestor(investor.id, 'profitShare', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeInvestor(investor.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="payment">
                <div className="space-y-4">
                  {investors.map(investor => (
                    <div key={investor.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Investor</Label>
                        <Input value={investor.name} disabled />
                      </div>
                      <div>
                        <Label>Amount Paid (BDT)</Label>
                        <Input
                          type="number"
                          value={investor.amountPaid}
                          onChange={(e) => updateInvestor(investor.id, 'amountPaid', Number(e.target.value))}
                          min="0"
                          max={investor.investmentAmount}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Amount Due (BDT)</Label>
                        <Input
                          value={formatCurrency(investor.amountDue)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Payment Method</Label>
                        <Select 
                          value={investor.payments[0]?.paymentMethod || 'bank'}
                          onValueChange={(value: 'bank' | 'cash' | 'card' | 'mobile banking') => {
                            // In a real app, you would update the payment method here
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="mobile banking">Mobile Banking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  
                  {/* Investor Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm">Total Investment</Label>
                      <div className="font-bold">{formatCurrency(totalInvestment)}</div>
                    </div>
                    <div>
                      <Label className="text-sm">Total Paid</Label>
                      <div className="font-bold text-green-600">{formatCurrency(totalPaid)}</div>
                    </div>
                    <div>
                      <Label className="text-sm">Total Due</Label>
                      <div className="font-bold text-destructive">{formatCurrency(totalDue)}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Tax and Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="applyTax"
              checked={applyTax}
              onCheckedChange={(checked) => setApplyTax(checked as boolean)}
            />
            <Label htmlFor="applyTax">Apply Tax</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Amount Paid (BDT)</Label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                min="0"
                max={totalAmount}
                step="0.01"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile banking">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction reference"
              />
            </div>
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
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary border-t pt-2">
              <span>Amount Due:</span>
              <span>{formatCurrency(amountDue)}</span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-6" 
            size="lg"
            onClick={handleSubmit}
            disabled={!vendor || products.some(p => !p.name || p.quantity <= 0 || p.unitPrice <= 0)}
          >
            Create Purchase Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}