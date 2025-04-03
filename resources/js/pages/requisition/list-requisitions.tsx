import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import DataTable from "@/components/datatable";
import Confirmation from "@/components/confirmation-modal";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "All Requisitions",
    href: "/dashboard",
  },
];

interface RequisitionDataTableProps {
  flash: {
    message?: string;
    error?: string;
  };
}

export default function ListRequisition({ flash }: RequisitionDataTableProps) {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const [selectedRequisitions, setSelectedRequisitions] = useState<number[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "fulfilled":
        return "bg-indigo-100 text-indigo-800";
      case "closed":
        return "bg-purple-100 text-purple-800";
      case "canceled":
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const createEOI = () => {
    router.visit(route("eois.create", { requisition_ids: selectedRequisitions }));
  };

  const showMessage = () => {
    confirm("Please select Requisitions First");
  };

  const columns = [
    {
      data: "select",
      title: "Select",
      className: "px-4 py-4 whitespace-nowrap text-sm",
      orderable: false,
      searchable: false,
      visible: user?.permissions?.includes("create eois"),
      render: function (data: any, type: any, row: any) {
        const disabled = row.status !== "submitted" || row.eoi_id;
        return `<input type="checkbox" class="requisition-select h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                data-id="${row.id}" ${disabled ? "disabled" : ""}>`;
      },
    },
    {
      data: "requester",
      title: "Requester",
      className: "px-6 py-4 whitespace-nowrap",
    },
    {
      data: "title",
      title: "Title",
      className: "px-6 py-4 whitespace-nowrap",
    },
    {
      data: "products",
      title: "Request Item",
      className: "px-6 py-4 whitespace-nowrap",
      orderable: false,
    },
    {
      data: "quantities",
      title: "Required Quantity",
      className: "px-6 py-4 whitespace-nowrap",
      orderable: false,
    },
    {
      data: "in_stock",
      title: "In Stock",
      className: "px-6 py-4 whitespace-nowrap",
      orderable: false,
      visible: user?.permission?.includes("create eois"),
    },
    {
      data: "required_date",
      title: "Required Date",
      className: "px-6 py-4 whitespace-nowrap",
    },
    {
      data: "status",
      title: "Status",
      className: "px-6 py-4 whitespace-nowrap",
      render: function (data: string) {
        return `<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
          data
        )}">${data.replace("_", " ")}</span>`;
      },
    },
    {
      data: "actions",
      title: "Actions",
      className: "px-6 py-4 whitespace-nowrap",
      orderable: false,
      searchable: false,
    },
  
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Requisitions" />

      <div className="py-12">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-4">Recent Requisitions</h2>

          {/* Flash Message */}
          {flash.message && (
            <div className="mb-4 text-green-600 bg-green-100 border border-green-400 px-4 py-2 rounded-md">
              {flash.message}
            </div>
          )}
          {flash.error && (
            <div className="mb-4 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-md">
              {flash.error}
            </div>
          )}

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              {/* "Create EOI" */}
              {user?.permissions?.includes("create eois") && (
                <button
                  onClick={selectedRequisitions.length === 0 ? showMessage : createEOI}
                  className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  Create EOI (selected({selectedRequisitions.length}))
                </button>
              )}

              {/* "Add New Requisition"*/}
              {user?.permissions?.includes("create requisitions") && (
                <Link
                  href={route("requisitions.create")}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  Add New Requisition
                </Link>
              )}
            </div>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <DataTable
                columns={columns}
                ajaxUrl="/requisitions"
                onDrawCallback={() => {
                  // Handle checkbox selection after table redraw
                  document.querySelectorAll('.requisition-select').forEach((checkbox: Element) => {
                    const checkboxEl = checkbox as HTMLInputElement;
                    const requisitionId = Number(checkboxEl.dataset.id);

                    checkboxEl.checked = selectedRequisitions.includes(requisitionId);

                    checkboxEl.addEventListener('change', () => {
                      if (checkboxEl.checked) {
                        setSelectedRequisitions(prev => [...prev, requisitionId]);
                      } else {
                        setSelectedRequisitions(prev => prev.filter(id => id !== requisitionId));
                      }
                    });
                  });
                }}
                destroy={true}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}