"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "@/lib/axios-instance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Plus, RotateCcw, Trash2, PlusCircle, DollarSign, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/sidebar";

// Validation schema - Fixed variant validation
const restockSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than 0"),
  salePrice: z.coerce.number().min(0.01, "Sale price must be greater than 0"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  barcode: z.string().optional(),
  previousProductId: z.string().optional(),
  hasVariants: z.boolean().default(false),
  hasInvestors: z.boolean().default(false),
  variants: z.array(z.object({
    type: z.string().min(1, "Variant type is required"),
    value: z.string().min(1, "Variant value is required"),
    purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than 0"),
    salePrice: z.coerce.number().min(0.01, "Sale price must be greater than 0"),
    quantity: z.coerce.number().min(1, "Variant quantity must be at least 1"),
  })).optional(),
  investors: z.array(z.object({
    investorId: z.string().min(1, "Investor is required"),
    investmentAmount: z.coerce.number().min(0.01, "Investment amount must be greater than 0"),
    profitPercentage: z.coerce.number().min(0, "Profit percentage must be at least 0").max(100, "Profit percentage cannot exceed 100"),
  })).optional(),
});

type RestockFormValues = z.infer<typeof restockSchema>;

interface Product {
  id: string;
  productId: string;
  name: string;
  category: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  variant?: string;
}

// Predefined variant types
const VARIANT_TYPES = [
  { value: "size", label: "Size" },
  { value: "color", label: "Color" },
  { value: "material", label: "Material" },
  { value: "style", label: "Style" },
  { value: "flavor", label: "Flavor" },
  { value: "capacity", label: "Capacity" },
  { value: "weight", label: "Weight" },
  { value: "other", label: "Other" },
];

// Dummy investors data
const DUMMY_INVESTORS = [
  { id: "1", name: "Mr. Zaman", email: "zaman@example.com" },
  { id: "2", name: "Ms. Rahman", email: "rahman@example.com" },
  { id: "3", name: "Alam Group", email: "alam@example.com" },
  { id: "4", name: "Karim Traders", email: "karim@example.com" },
  { id: "5", name: "Jahanara Foundation", email: "jahanara@example.com" },
];

export default function RestockPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      name: "",
      category: "",
      purchasePrice: 0,
      salePrice: 0,
      quantity: 1,
      barcode: "",
      previousProductId: "",
      hasVariants: false,
      hasInvestors: false,
      variants: [],
      investors: [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: investorFields, append: appendInvestor, remove: removeInvestor } = useFieldArray({
    control: form.control,
    name: "investors",
  });

  const hasVariants = form.watch("hasVariants");
  const hasInvestors = form.watch("hasInvestors");
  const isCreateMode = !selectedProduct;

  // Debug form errors
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form values:", value);
    });
    console.log("Form errors:", form.formState.errors);
    return () => subscription.unsubscribe();
  }, [form, form.formState.errors]);

  // Get userId from localStorage on client side
  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  // Search products with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchProducts = async () => {
      setIsSearching(true);
      try {
        // Using dummy search results for simulation
        const dummyResults: Product[] = [
          {
            id: "1",
            productId: "PROD001",
            name: "Sample Product",
            category: "Electronics",
            barcode: "123456789",
            purchasePrice: 500,
            salePrice: 800,
            quantity: 10,
          },
          {
            id: "2",
            productId: "PROD002",
            name: "Another Product",
            category: "Clothing",
            barcode: "987654321",
            purchasePrice: 200,
            salePrice: 350,
            quantity: 5,
          },
        ].filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode.includes(searchTerm)
        );
        
        setSearchResults(dummyResults);
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Failed to search products");
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm("");
    setSearchResults([]);

    // Reset variants and investors when selecting existing product
    form.reset({
      name: product.name,
      category: product.category,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      quantity: 1,
      barcode: product.barcode,
      previousProductId: product.id,
      hasVariants: false,
      hasInvestors: false,
      variants: [],
      investors: [],
    });
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    form.reset({
      name: "",
      category: "",
      purchasePrice: 0,
      salePrice: 0,
      quantity: 1,
      barcode: "",
      previousProductId: "",
      hasVariants: false,
      hasInvestors: false,
      variants: [],
      investors: [],
    });
  };

  const addVariant = () => {
    const currentPrices = form.watch();
    appendVariant({
      type: "size",
      value: "",
      purchasePrice: currentPrices.purchasePrice || 0,
      salePrice: currentPrices.salePrice || 0,
      quantity: 1
    });
  };

  const handleRemoveVariant = (index: number) => {
    removeVariant(index);
  };

  const addInvestor = () => {
    appendInvestor({
      investorId: "",
      investmentAmount: 0,
      profitPercentage: 0
    });
  };

  const handleRemoveInvestor = (index: number) => {
    removeInvestor(index);
  };

  // Initialize variants when hasVariants is checked
  useEffect(() => {
    if (hasVariants && isCreateMode && variantFields.length === 0) {
      addVariant();
    }
  }, [hasVariants, isCreateMode]);

  // Initialize investors when hasInvestors is checked
  useEffect(() => {
    if (hasInvestors && investorFields.length === 0) {
      addInvestor();
    }
  }, [hasInvestors]);

  const submitProduct = async (productData: any) => {
    try {
      // Simulate API call with dummy response
      console.log("Submitting product:", productData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy response based on the action
      const dummyResponse = {
        action: productData.previousProductId ? "STOCK_UPDATED" : "CREATED_NEW",
        product: {
          id: Math.random().toString(36).substr(2, 9),
          ...productData
        }
      };
      
      return dummyResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create product");
    }
  };

  const onSubmit = async (data: RestockFormValues) => {
    console.log("Form submission started with data:", data);
    
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle variant products (multiple API calls)
      if (isCreateMode && hasVariants && data.variants) {
        const validVariants = data.variants.filter(v => v.value.trim() !== "");

        if (validVariants.length === 0) {
          toast.error("Please add at least one valid variant");
          return;
        }

        let successCount = 0;
        const errors: string[] = [];

        // Submit each variant as separate product
        for (const variant of validVariants) {
          try {
            const variantData = {
              name: `${data.name} (${variant.value})`,
              category: data.category,
              purchasePrice: variant.purchasePrice,
              salePrice: variant.salePrice,
              quantity: variant.quantity,
              barcode: data.barcode ? `${data.barcode}-${variant.value}` : undefined,
              variant: `${variant.type}: ${variant.value}`,
              investors: data.investors, // Include investors for each variant
            };

            await submitProduct(variantData);
            successCount++;
          } catch (error: any) {
            errors.push(`Variant "${variant.value}": ${error.message}`);
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully created ${successCount} variant(s)`);
        }
        if (errors.length > 0) {
          toast.error(`Some variants failed: ${errors.join(', ')}`);
        }

        if (successCount > 0) {
          handleClearSelection();
        }

      } else {
        // Handle single product (no variants or restocking)
        const payload = {
          ...data,
          userId: userId,
          // Clear variants if not in variant mode
          variant: isCreateMode && hasVariants ? undefined : data.variants?.[0]?.value ? `${data.variants[0].type}: ${data.variants[0].value}` : undefined,
        };

        // Remove variants array from payload for single product
        const { variants, ...singleProductPayload } = payload;

        const response = await submitProduct(singleProductPayload);

        // Handle different response actions
        switch (response.action) {
          case "CREATED_NEW":
            toast.success("New product created successfully!");
            break;
          case "CREATED_NEW_GENERATION":
            toast.success("New product generation created with updated prices!");
            break;
          case "STOCK_UPDATED":
            toast.success("Product stock updated successfully!");
            break;
          default:
            toast.success("Product restocked successfully!");
        }

        handleClearSelection();
      }

    } catch (error: any) {
      console.error("Operation failed:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPriceChanged = () => {
    if (!selectedProduct) return false;
    const currentValues = form.watch();
    return (
      currentValues.purchasePrice !== selectedProduct.purchasePrice ||
      currentValues.salePrice !== selectedProduct.salePrice
    );
  };

  const totalVariantQuantity = hasVariants
    ? (form.watch("variants")?.reduce((sum, variant) => sum + (Number(variant.quantity) || 0), 0) || 0)
    : 0;

  const totalVariantValue = hasVariants
    ? (form.watch("variants")?.reduce((sum, variant) => sum + ((Number(variant.quantity) || 0) * (Number(variant.salePrice) || 0)), 0) || 0)
    : 0;

  const totalInvestment = hasInvestors
    ? (form.watch("investors")?.reduce((sum, investor) => sum + (Number(investor.investmentAmount) || 0), 0) || 0)
    : 0;

  const totalProfitPercentage = hasInvestors
    ? (form.watch("investors")?.reduce((sum, investor) => sum + (Number(investor.profitPercentage) || 0), 0) || 0)
    : 0;

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />
      <div className="container mx-6 my-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Restock Products</h1>
            <p className="text-muted-foreground">
              Add new stock to existing products or create new product entries
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Products
              </CardTitle>
              <CardDescription>
                Find existing products to restock or update prices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, product ID, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>ID: {product.productId}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                          {product.variant && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {product.variant}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        ৳{product.salePrice}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No products found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}

              {/* Selected Product Info */}
              {selectedProduct && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Selected Product</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product ID:</span>
                      <Badge variant="outline">{selectedProduct.productId}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <span>{selectedProduct.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Prices:</span>
                      <span>
                        ৳{selectedProduct.purchasePrice} / ৳{selectedProduct.salePrice}
                      </span>
                    </div>
                    {selectedProduct.variant && (
                      <div className="flex justify-between">
                        <span>Variant:</span>
                        <Badge variant="secondary">{selectedProduct.variant}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Restock Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedProduct ? <RotateCcw className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {selectedProduct ? "Restock Product" : "Create New Product"}
              </CardTitle>
              <CardDescription>
                {selectedProduct
                  ? "Update stock and prices for the selected product"
                  : "Add a completely new product to inventory"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Electronics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Optional"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty to auto-generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Global Price Fields - Hide when variants are enabled */}
                  {(!hasVariants || !isCreateMode) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="purchasePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Price (৳)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              {selectedProduct && hasPriceChanged() && (
                                <FormDescription className="text-amber-600">
                                  Price changed from ৳{selectedProduct.purchasePrice}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="salePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sale Price (৳)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              {selectedProduct && hasPriceChanged() && (
                                <FormDescription className="text-amber-600">
                                  Price changed from ৳{selectedProduct.salePrice}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Variants Section - Only show in create mode */}
                  {isCreateMode && (
                    <FormField
                      control={form.control}
                      name="hasVariants"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>This product has variants</FormLabel>
                            <FormDescription>
                              Create multiple product entries for different sizes, colors, capacities, etc. with individual pricing
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Variant Fields */}
                  {isCreateMode && hasVariants && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label>Product Variants</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVariant}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </div>

                      {/* Display variant array errors */}
                      {form.formState.errors.variants && (
                        <div className="p-2 text-sm text-destructive bg-destructive/10 rounded">
                          {typeof form.formState.errors.variants.message === 'string' 
                            ? form.formState.errors.variants.message 
                            : 'Please fix variant errors below'}
                        </div>
                      )}

                      <div className="space-y-4">
                        {variantFields.map((field, index) => (
                          <div key={field.id} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium">Variant {index + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveVariant(index)}
                                disabled={variantFields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-12 gap-3">
                              {/* First line: Type + Value */}
                              <div className="col-span-6">
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {VARIANT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="col-span-6">
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.value`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Value</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., XL, Red, 50L" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Second line: Cost + Sale Price + Qty */}
                              <div className="col-span-4">
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.purchasePrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Cost</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="pl-8"
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="col-span-4">
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.salePrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Sale Price</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="pl-8"
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="col-span-4">
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Qty</FormLabel>
                                      <FormControl>
                                        <Input type="number" min="1" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>

                      {(totalVariantQuantity > 0 || totalVariantValue > 0) && (
                        <div className="pt-2 border-t space-y-1">
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Total variants quantity:</span>
                            <strong>{Number(totalVariantQuantity)} units</strong>
                          </div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Total inventory value:</span>
                            <strong>৳{Number(totalVariantValue).toFixed(2)}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Investors Section */}
                  <FormField
                    control={form.control}
                    name="hasInvestors"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This product has investors</FormLabel>
                          <FormDescription>
                            Attach investors who will receive a percentage of the profit from this product
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Investor Fields */}
                  {hasInvestors && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Product Investors
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addInvestor}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Add Investor
                        </Button>
                      </div>

                      {/* Display investor array errors */}
                      {form.formState.errors.investors && (
                        <div className="p-2 text-sm text-destructive bg-destructive/10 rounded">
                          {typeof form.formState.errors.investors.message === 'string' 
                            ? form.formState.errors.investors.message 
                            : 'Please fix investor errors below'}
                        </div>
                      )}

                      <div className="space-y-4">
                        {investorFields.map((field, index) => (
                          <div key={field.id} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium">Investor {index + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveInvestor(index)}
                                disabled={investorFields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-12 gap-3">
                              {/* Investor Selection */}
                              <div className="col-span-6">
                                <FormField
                                  control={form.control}
                                  name={`investors.${index}.investorId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Investor</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select investor" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {DUMMY_INVESTORS.map((investor) => (
                                            <SelectItem key={investor.id} value={investor.id}>
                                              {investor.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Investment Amount */}
                              <div className="col-span-3">
                                <FormField
                                  control={form.control}
                                  name={`investors.${index}.investmentAmount`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Investment (৳)</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="pl-8"
                                            placeholder="0.00"
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Profit Percentage */}
                              <div className="col-span-3">
                                <FormField
                                  control={form.control}
                                  name={`investors.${index}.profitPercentage`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Profit %</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          max="100"
                                          placeholder="0.00"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Display selected investor info */}
                            {field.investorId && (
                              <div className="mt-2 p-2  rounded text-xs">
                                <div className="flex justify-between">
                                  <span>Investor:</span>
                                  <span className="font-medium">
                                    {DUMMY_INVESTORS.find(inv => inv.id === field.investorId)?.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Email:</span>
                                  <span>
                                    {DUMMY_INVESTORS.find(inv => inv.id === field.investorId)?.email}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {(totalInvestment > 0 || totalProfitPercentage > 0) && (
                        <div className="pt-2 border-t space-y-1">
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Total investment:</span>
                            <strong>৳{Number(totalInvestment).toFixed(2)}</strong>
                          </div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Total profit share:</span>
                            <strong>{Number(totalProfitPercentage).toFixed(2)}%</strong>
                          </div>
                          {totalProfitPercentage > 100 && (
                            <div className="text-sm text-destructive flex justify-between">
                              <span>Warning:</span>
                              <strong>Profit share exceeds 100%</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Single Product Quantity - Hide when variants are enabled */}
                  {(!hasVariants || !isCreateMode) && (
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity to Add</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Enter quantity"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {selectedProduct && (
                              <>New total stock: {Number(selectedProduct.quantity) + Number(field.value || 0)}</>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Price Change Warning */}
                  {selectedProduct && hasPriceChanged() && (
                    <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">Price Change Detected</span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        Changing prices will create a new product generation. The previous stock will be kept separate.
                      </p>
                    </div>
                  )}

                  {/* Variant Creation Warning */}
                  {isCreateMode && hasVariants && (
                    <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">Creating Multiple Variants</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        This will create {variantFields.length} separate product entries with different pricing and stock levels.
                      </p>
                    </div>
                  )}

                  {/* Investor Warning */}
                  {hasInvestors && (
                    <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Investor Agreement</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        {investorFields.length} investor(s) will receive a share of the profit from this product according to their specified percentages.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {hasVariants && isCreateMode ? 'Creating Variants...' : 'Processing...'}
                      </>
                    ) : selectedProduct ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restock Product
                      </>
                    ) : hasVariants ? (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Variants ({variantFields.length})
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Product
                      </>
                    )}
                  </Button>

                  <input type="hidden" {...form.register("previousProductId")} />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}