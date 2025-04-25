import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DataTable from '@/components/datatable';
// import DeleteModal from '@/components/delete-modal';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'All Vendors',
    href: '/dashboard',
  },
];

interface EoiProps {
  flash: {
    message?: string;
    error?: string;
  };
}

export default function ListVendors({ flash }: EoiProps) {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'fulfilled':
        return 'bg-indigo-100 text-indigo-800';
      case 'closed':
        return 'bg-purple-100 text-purple-800';
      case 'canceled':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      data: 'vendor_name',
      title: 'Vendor Name',
      className: 'px-6 py-4 whitespace-nowrap',
      render: function(data: any) {
        return data || 'N/A';
      }
    },
    {
      data: 'registration_number',
      title: 'Reg. Number',
      className: 'px-6 py-4 whitespace-nowrap',
    },
    {
      data: 'pan_number',
      title: 'PAN Number',
      className: 'px-6 py-4 whitespace-nowrap',
    },
    // {
    //   data: 'name',
    //   title: 'Name',
    //   className: 'px-6 py-4 whitespace-nowrap',
    // },
    {
      data: 'email',
      title: 'Email',
      className: 'px-6 py-4 whitespace-nowrap',
      orderable: false,
    },
    {
      data: 'phone',
      title: 'Phone',
      className: 'px-6 py-4 whitespace-nowrap',
    },
    // {
    //   data: 'status',
    //   title: 'Status',
    //   className: 'px-6 py-4 whitespace-nowrap',
    //   render: function(data: string) {
    //     return `<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(data)}">${data || 'N/A'}</span>`;
    //   }
    // },
    {
      data: 'actions',
      title: 'Actions',
      className: 'px-6 py-4 whitespace-nowrap',
      orderable: false,
      searchable: false,
    }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="EOIs" />

      <div className="py-12">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold mb-4">Vendor List</h2>

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
            {/* <div className='flex justify-end mb-6'>
              <Link
                href={route('eois.create')}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Create New EOI
              </Link>
            </div> */}
            
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <DataTable
                columns={columns}
                ajaxUrl="/vendors"
                onDrawCallback={() => {
                //   // Handle the delete button click
                //   document.querySelectorAll('.delete-eoi').forEach((button: Element) => {
                //     button.addEventListener('click', (e) => {
                //       e.preventDefault();
                //       const id = (e.currentTarget as HTMLElement).dataset.id;

                //       if (confirm('Are you sure you want to delete this EOI?')) {
                //         router.delete(route('eois.destroy', id));
                //       }
                //     });
                //   });
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