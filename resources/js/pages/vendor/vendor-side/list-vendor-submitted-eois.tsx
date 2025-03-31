import React, { useEffect, useRef } from "react";
import { BreadcrumbItem, PageProps } from "@/types";
import AppLayout from '@/layouts/app-layout';
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
// import "datatables.net/css/jquery.dataTables.min.css"; // Non-minified version
import "datatables.net";
import { Head } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'All Requisitions',
    href: '/dashboard',
  },
];

interface Submission {
  id: number;
  eoi_id: number;
  eoi_number: string;
  vendor_id: number;
  created_at: string;
  updated_at: string;
}

const ListVendorSubmittedEois: React.FC<PageProps> = () => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      $(tableRef.current).DataTable({
        processing: true,
        serverSide: true,
        ajax: "/vendor/submitted-eois",
        columns: [
          { data: "id", title: "ID" },
          { data: "eoi_number", title: "EOI Number" },
          { data: "created_at", title: "Submitted At" },
          {
            data: "actions",
            title: "Actions",
            orderable: false,
            searchable: false,
          },
        ],
      });
    }
  }, []);

  return (
    // <AppLayout title="Vendor Submitted EOIs">
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="EOIs" />
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Submitted EOIs</h2>
        <table ref={tableRef} className="table-auto w-full border-collapse border border-gray-200" />
      </div>
   </AppLayout>
  );
};

export default ListVendorSubmittedEois;
