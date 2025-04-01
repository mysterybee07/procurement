import React from "react";
import { BreadcrumbItem, PageProps } from "@/types"; // Assuming this is where PageProps is defined
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import DataTable from "@/components/datatable";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Submitted EOIs",
    href: "/dashboard",
  },
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

interface ListSubmissionByEoiProps{
  eoi_id: number;
  eoi_number: string;
}

const ListSubmissionByEoi: React.FC<ListSubmissionByEoiProps> = ({ eoi_id, eoi_number }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`EOIs - ${eoi_number}`} />
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Submitted EOIs for {eoi_number}</h2>
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <DataTable columns={columns} ajaxUrl={`/eoi-submission/${eoi_id}`} />
        </div>
      </div>
    </AppLayout>
  );
};

export default ListSubmissionByEoi;
