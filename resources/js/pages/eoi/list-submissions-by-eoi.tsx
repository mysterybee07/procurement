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
  const [productCategory, setProductCategory] = useState("");
  const [product, setProduct] = useState("");
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
    if (productCategory) params.append("product_category", productCategory);
    if (product) params.append("product", product);
    
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
    setProductCategory("");
    setProduct("");
    
    // Reset datatable
    if (dataTable) {
      dataTable.ajax.url(`/eoi-submission/${eoi_id}`).load();
    }
  };

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

              {/* Product category filter */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Product Category:</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product filter */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Product:</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All Products</option>
                  {availableProducts.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
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