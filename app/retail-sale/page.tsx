'use client';

import { useState, useMemo } from 'react';
import type { Inventory, InventorySearchParams } from '@/types/inventory';
import { useGetInventoryQuery } from '@/lib/store/api/inventoryApi';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Trash2, ShoppingCart, Calculator } from 'lucide-react';

// Sale item type
interface SaleItem {
  product: Inventory;
  quantity: number;
  price: number;
}

export default function RetailSalesPage() {
  const [searchParams, setSearchParams] = useState<InventorySearchParams>({
    page: 1,
    limit: 12,
    search: '',
    sortBy: 'productName',
    sortOrder: 'asc'
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const { data: inventoryResponse, isLoading } = useGetInventoryQuery(searchParams);

  // Calculate totals
  const { subtotal, totalItems } = useMemo(() => {
    return saleItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + (item.price * item.quantity),
        totalItems: acc.totalItems + item.quantity
      }),
      { subtotal: 0, totalItems: 0 }
    );
  }, [saleItems]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({
      ...prev,
      search: searchInput,
      page: 1
    }));
  };

  // Add product to sale
  const addToSale = (product: Inventory) => {
    setSaleItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
          price: product.expectedSalePrice
        }
      ];
    });
  };

  // Update sale item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromSale(productId);
      return;
    }

    setSaleItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Update sale item price
  const updatePrice = (productId: string, price: number) => {
    setSaleItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, price: Math.max(0, price) }
          : item
      )
    );
  };

  // Remove from sale
  const removeFromSale = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Handle checkout
  const handleCheckout = () => {
    // Here you would typically send the sale data to your API
    console.log('Sale completed:', {
      items: saleItems,
      total: subtotal,
      timestamp: new Date().toISOString()
    });
    
    alert(`Sale completed! Total: ৳${subtotal.toFixed(2)}`);
    setSaleItems([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStockStatus = (quantity: number, minStock?: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (minStock && quantity <= minStock) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Retail Sales</h1>
            <p className="text-muted-foreground mt-1">
              Unofficial Sales - No Purchase Order Required
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {totalItems} Items
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Product Listing */}
          <div className="xl:col-span-2 space-y-6">
            {/* Search Card */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search products by name, code, or barcode..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading products...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventoryResponse?.data.map((product) => {
                      const stockStatus = getStockStatus(product.quantity, product.minStockLevel);
                      return (
                        <Card key={product.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg leading-tight">
                                {product.productName}
                              </h3>
                              <Badge variant={stockStatus.variant}>
                                {stockStatus.label}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Code:</span>
                                <span className="font-medium">{product.productCode}</span>
                              </div>
                              {product.barcode && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Barcode:</span>
                                  <span className="font-mono">{product.barcode}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Stock:</span>
                                <span className="font-medium">{product.quantity}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-bold text-primary">
                                  {formatCurrency(product.expectedSalePrice)}
                                </span>
                              </div>
                            </div>

                            {product.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {product.description}
                              </p>
                            )}

                            <Button
                              onClick={() => addToSale(product)}
                              disabled={product.quantity === 0}
                              className="w-full"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Sale
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {inventoryResponse?.data.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-muted-foreground">
                    No products found matching your search.
                  </div>
                )}

                {/* Pagination */}
                {inventoryResponse?.meta && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {inventoryResponse.meta.page} of {inventoryResponse.meta.totalPages}
                      {' • '}
                      {inventoryResponse.meta.total} total products
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! - 1 }))}
                        disabled={searchParams.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                        disabled={searchParams.page === inventoryResponse.meta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sale Cart */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Current Sale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {saleItems.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No items added to sale</p>
                    <p className="text-sm text-muted-foreground">
                      Search and add products from the list
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {saleItems.map((item) => (
                        <Card key={item.product.id} className="p-3">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm leading-tight">
                                  {item.product.productName}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {item.product.productCode}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromSale(item.product.id)}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                  className="w-20 text-center"
                                  min="1"
                                  max={item.product.quantity}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.quantity}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Price Input */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Unit Price:</span>
                                <span className="text-xs text-muted-foreground">
                                  Original: {formatCurrency(item.product.expectedSalePrice)}
                                </span>
                              </div>
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                                className="text-right font-medium"
                                step="0.01"
                                min="0"
                              />
                            </div>

                            {/* Item Total */}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-sm font-medium">Item Total:</span>
                              <span className="font-bold text-primary">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Total Items:</span>
                        <span className="font-medium">{totalItems}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Grand Total:</span>
                        <span className="text-primary">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <Button
                        onClick={handleCheckout}
                        disabled={saleItems.length === 0}
                        className="w-full"
                        size="lg"
                      >
                        <Calculator className="w-5 h-5 mr-2" />
                        Complete Sale
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}