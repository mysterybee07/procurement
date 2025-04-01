import React from "react";
import { BreadcrumbItem, PageProps } from "@/types";
import AppLayout from '@/layouts/app-layout';
import { Head } from "@inertiajs/react";
import DataTable from "@/components/datatable";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Submitted EOIs',
    href: '/dashboard',
  },
];

const columns = [
  { data: "eoi_number", title: "EOI Number", className: "text-center" },
  { data: "submission_date", title: "Submitted At", className: "text-center" },
  { data: "items_total_price", title: "Total Price", className: "text-center" },
  { data: "status", title: "Status", className: "text-center" },
  { 
    data: "actions", 
    title: "Actions", 
    className: "text-center", 
    orderable: false, 
    searchable: false 
  },
];

const ListVendorSubmittedEois: React.FC<PageProps> = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="EOIs" />
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Submitted EOIs</h2>
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <DataTable columns={columns} ajaxUrl="/vendor/submitted-eois" />
        </div>
      </div>
    </AppLayout>
  );
};

export default ListVendorSubmittedEois;
