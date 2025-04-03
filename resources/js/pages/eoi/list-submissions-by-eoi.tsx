import React, { useState } from "react";
import { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import DataTable from "@/components/datatable";

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
}

const ListSubmissionByEoi: React.FC<ListSubmissionByEoiProps> = ({ eoi_id, eoi_number }) => {
  const [ratingFilter, setRatingFilter] = useState("");

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`EOIs - ${eoi_number}`} />
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Submitted EOIs for {eoi_number}</h2>

        {/* Dropdown for Filtering */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Filter Vendors By:</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="border p-2 rounded max-w-5/6"
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

        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <DataTable 
            columns={columns} 
            ajaxUrl={`/eoi-submission/${eoi_id}?rating_filter=${ratingFilter}`} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default ListSubmissionByEoi;
