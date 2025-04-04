import React, { useState, useEffect } from "react";
import { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import DataTable from "@/components/datatable";
import { Button } from "@headlessui/react";
import BeginSelectionModal from "@/components/vendor-selection-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Submitted EOIs", href: "/dashboard" },
];

const columns = [
  { data: "vendor_name", title: "Vendor Name", className: "text-center" },
  { data: "phone", title: "Vendor Contact", className: "text-center" },
  { data: "items_total_price", title: "Total Quoted Price", className: "text-center" },
  { data: "submission_date", title: "Submitted At", className: "text-center" },
  { data: "delivery_date", title: "Target Delivery Date", className: "text-center" },
  { data: "status", title: "Status", className: "text-center" },
  {
    data: "actions",
    title: "Actions",
    className: "text-center",
    orderable: false,
    searchable: false
  },
];

interface ListSubmissionByEoiProps {
  eoi_id: number;
  eoi_number: string;
  eoi_status: string;
}

const ListSubmissionByEoi: React.FC<ListSubmissionByEoiProps> = ({ eoi_id, eoi_number, eoi_status }) => {
  // State for filters
  const [ratingFilter, setRatingFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDeliveryDate, setStartDeliveryDate] = useState<Date | null>(null);
  const [endDeliveryDate, setEndDeliveryDate] = useState<Date | null>(null);
  
  // Changed from string to string[] for multiselect
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Dropdown state management
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [dataTable, setDataTable] = useState<any>(null);

  // Format dates for the API query
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Build the API URL with all filters
  const buildApiUrl = () => {
    let url = `/eoi-submission/${eoi_id}`;
    const params = new URLSearchParams();
    
    if (ratingFilter) params.append("rating_filter", ratingFilter);
    if (minPrice) params.append("min_price", minPrice);
    if (maxPrice) params.append("max_price", maxPrice);
    if (startDeliveryDate) params.append("start_delivery_date", formatDate(startDeliveryDate));
    if (endDeliveryDate) params.append("end_delivery_date", formatDate(endDeliveryDate));
    
    // Handle multiple selected categories
    if (selectedProductCategories.length > 0) {
      selectedProductCategories.forEach(category => {
        params.append("product_categories[]", category);
      });
    }
    
    // Handle multiple selected products
    if (selectedProducts.length > 0) {
      selectedProducts.forEach(product => {
        params.append("products[]", product);
      });
    }
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  };

  // Effect to fetch products and categories on mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`/eoi/${eoi_id}/products`);
        if (response.ok) {
          const data = await response.json();
          setAvailableProducts(data.products || []);
          setAvailableCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [eoi_id]);

  // Apply filters
  const applyFilters = () => {
    if (dataTable) {
      dataTable.ajax.url(buildApiUrl()).load();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setRatingFilter("");
    setMinPrice("");
    setMaxPrice("");
    setStartDeliveryDate(null);
    setEndDeliveryDate(null);
    setSelectedProductCategories([]);
    setSelectedProducts([]);
    
    // Reset datatable
    if (dataTable) {
      dataTable.ajax.url(`/eoi-submission/${eoi_id}`).load();
    }
  };

  // Toggle category selection
  const toggleCategorySelection = (category: string) => {
    setSelectedProductCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Toggle product selection
  const toggleProductSelection = (product: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(product)) {
        return prev.filter(p => p !== product);
      } else {
        return [...prev, product];
      }
    });
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedProductCategories([...availableCategories]);
  };

  // Deselect all categories
  const deselectAllCategories = () => {
    setSelectedProductCategories([]);
  };

  // Select all products
  const selectAllProducts = () => {
    setSelectedProducts([...availableProducts]);
  };

  // Deselect all products
  const deselectAllProducts = () => {
    setSelectedProducts([]);
  };

  // Format the display text for dropdowns
  const getCategoryDisplayText = () => {
    if (selectedProductCategories.length === 0) return "All Categories";
    if (selectedProductCategories.length === 1) return selectedProductCategories[0];
    if (selectedProductCategories.length === availableCategories.length) return "All Categories";
    return `${selectedProductCategories.length} categories selected`;
  };

  const getProductDisplayText = () => {
    if (selectedProducts.length === 0) return "All Products";
    if (selectedProducts.length === 1) return selectedProducts[0];
    if (selectedProducts.length === availableProducts.length) return "All Products";
    return `${selectedProducts.length} products selected`;
  };

  // Handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
      if (!target.closest('.product-dropdown')) {
        setIsProductDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // DataTable reference callback
  const dataTableRef = (dtInstance: any) => {
    setDataTable(dtInstance);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`EOIs - ${eoi_number}`} />
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Submitted EOIs for {eoi_number}</h2>
        
        <div className="flex items-center justify-between w-full mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          
          {eoi_status === "closed" && (
            <div className="ml-auto">
              <BeginSelectionModal eoiId={eoi_id} />
            </div>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-lg mb-3">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Rating filter */}
              {eoi_status === "under_selection" && (
                <div className="mb-4">
                  <label className="block font-semibold mb-2">Filter By Rating:</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">All Vendors</option>
                    <option value="by_documents">Documents</option>
                    <option value="by_submission_completeness">Submission Completeness</option>
                    <option value="by_pricing">Pricing</option>
                    <option value="by_delivery">Delivery Date</option>
                    <option value="by_past_performance">Past Performance</option>
                    <option value="by_overall_rating">Overall Rating</option>
                  </select>
                </div>
              )}

              {/* Price range filter */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Price Range:</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Delivery date range filter */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Delivery Date Range:</label>
                <div className="flex space-x-2">
                  <DatePicker
                    selected={startDeliveryDate}
                    onChange={(date) => setStartDeliveryDate(date)}
                    placeholderText="Start Date"
                    className="border p-2 rounded w-full"
                  />
                  <DatePicker
                    selected={endDeliveryDate}
                    onChange={(date) => setEndDeliveryDate(date)}
                    placeholderText="End Date"
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Product category multiselect dropdown */}
              <div className="mb-4 relative category-dropdown">
                <label className="block font-semibold mb-2">Product Categories:</label>
                <div 
                  className="border p-2 rounded w-full flex justify-between items-center cursor-pointer bg-white"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  <div className="truncate">
                    {getCategoryDisplayText()}
                  </div>
                  <div>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Dropdown content */}
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                    <div className="sticky top-0 bg-white p-2 border-b flex justify-between">
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllCategories();
                        }}
                      >
                        Select All
                      </button>
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deselectAllCategories();
                        }}
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {availableCategories.map((category) => (
                        <div 
                          key={category} 
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategorySelection(category);
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={selectedProductCategories.includes(category)}
                            onChange={() => {}} // Handled by div click
                            className="mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="cursor-pointer w-full"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                      {availableCategories.length === 0 && (
                        <div className="p-2 text-gray-500 text-sm">No categories available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product multiselect dropdown */}
              <div className="mb-4 relative product-dropdown">
                <label className="block font-semibold mb-2">Products:</label>
                <div 
                  className="border p-2 rounded w-full flex justify-between items-center cursor-pointer bg-white"
                  onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                >
                  <div className="truncate">
                    {getProductDisplayText()}
                  </div>
                  <div>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Dropdown content */}
                {isProductDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                    <div className="sticky top-0 bg-white p-2 border-b flex justify-between">
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllProducts();
                        }}
                      >
                        Select All
                      </button>
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deselectAllProducts();
                        }}
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {availableProducts.map((product) => (
                        <div 
                          key={product} 
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProductSelection(product);
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`product-${product}`}
                            checked={selectedProducts.includes(product)}
                            onChange={() => {}} // Handled by div click
                            className="mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label 
                            htmlFor={`product-${product}`}
                            className="cursor-pointer w-full"
                          >
                            {product}
                          </label>
                        </div>
                      ))}
                      {availableProducts.length === 0 && (
                        <div className="p-2 text-gray-500 text-sm">No products available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter action buttons */}
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                onClick={resetFilters}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Reset
              </Button>
              <Button
                onClick={applyFilters}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* DataTable */}
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <DataTable
            columns={columns}
            ajaxUrl={buildApiUrl()}
            // tableRef={dataTableRef}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default ListSubmissionByEoi;