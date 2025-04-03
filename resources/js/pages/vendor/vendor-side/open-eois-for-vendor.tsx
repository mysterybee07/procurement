import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import DeleteModal from '@/components/delete-modal';
import { Button } from '@headlessui/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'All Requisitions',
    href: '/dashboard',
  },
];
interface Eoi {
  id: number;
  eoi_number: number;
  title: string;
  description: string;
  created_at: string;
  submission_deadline: string;
  status: string;
  requisitions: Array<{
    requester: {
      name: string;
    }
  }>;
  created_by: {
    name: string;
  };
}

interface Category {
  category_name: string;
}

interface EoiProps {
  eois: {
    data: Eoi[];
    current_page: number;
    last_page: number;
  };
  categories: Category[];
  flash: {
    message?: string;
    error?: string;
  };
}

export default function ListEOI({ eois, flash, categories }: EoiProps) {
  const [showFullDescriptionMap, setShowFullDescriptionMap] = useState<{ [key: number]: boolean }>({});

  // const toggleDescription = (eoiId: number) => {
  //   setShowFullDescriptionMap(prev => ({
  //     ...prev,
  //     [eoiId]: !prev[eoiId]
  //   }));
  // };
  console.log(categories);
  const getDescription = (eoi: Eoi) => {
    const isFullDescriptionShown = showFullDescriptionMap[eoi.id];
    return isFullDescriptionShown ? eoi.description : `${eoi.description.substring(0, 200)}...`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="EOIs" />

      <div className="py-8">
        <div className="w-full mx-auto sm:px-6 lg:px-8">
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

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-2">
            <div className="text-lg font-semibold mb-4">
              Recently Opened EOIs
            </div>
            <hr />
            <div className="overflow-x-auto mt-4">

              {eois.data.map((eoi) => (
                <div key={eoi.id} className="bg-white rounded-xl shadow-md relative mb-4">
                  <div className="p-4">
                    <div className="mb-6">
                      <div className='flex justify-between'>
                      <div className="text-gray-600 my-2">EOI Number: {eoi.eoi_number}</div>
                      <div>{eoi.status}</div>
                      </div>
                      <h3 className="text-xl font-bold">{eoi.title}</h3>
                    </div>

                    <div className="mb-5">
                      {getDescription(eoi)}
                    </div>

                    {/* <button 
                      onClick={() => toggleDescription(eoi.id)} 
                      className='text-indigo-500 mb-5 hover:text-indigo-600'
                    >
                      {showFullDescriptionMap[eoi.id] ? 'Less' : 'More'}
                    </button> */}

                    <h3 className="text-indigo-500 mb-2">Company Name: Whetstone Associates</h3>
                    {categories.length > 0 && (
                      <h5 className="text-indigo-400 mb-2">
                        Category: {categories.join(', ')}
                      </h5>
                    )}

                    <div className="border border-gray-100 mb-5"></div>

                    <div className="flex flex-col lg:flex-row justify-between mb-4">
                      {eoi.status === "published" && eoi.submission_deadline ==="" ? (
                        <div className="text-red-600 mb-3">EOI is not open to submission</div>
                      ) : new Date(eoi.submission_deadline) < new Date() ? (
                        <div className="text-red-600 mb-3">Submission deadline crossed</div>
                      ) : (
                        <div className="text-orange-700 mb-3">
                          Submission Deadline: {eoi.submission_deadline}
                        </div>
                      )}
                      {/* {eoi.status!=="closed"&&(
                      <div className="text-orange-700 mb-3">
                         {eoi.status}
                      </div>
                      )} */}
                      <Link
                        href={`/vendor/eois/${eoi.id}`}
                        className="h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {eois.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Link
                    href={eois.current_page > 1 ? route('eois.index', { page: eois.current_page - 1 }) : '#'}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${eois.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={eois.current_page < eois.last_page ? route('eois.index', { page: eois.current_page + 1 }) : '#'}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${eois.current_page === eois.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </Link>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {Array.from({ length: eois.last_page }, (_, i) => i + 1).map((page) => (
                        <Link
                          key={page}
                          href={route('eois.index', { page })}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === eois.current_page
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                        >
                          {page}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}