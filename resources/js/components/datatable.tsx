import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

interface DataTableProps {
  columns: Array<{ data: string; title: string; orderable?: boolean; searchable?: boolean; className?: string }>;
  ajaxUrl: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, ajaxUrl }) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    $("<style>")
      .prop("type", "text/css")
      .html(`
        table.dataTable thead th, 
        table.dataTable thead td,
        table.dataTable tbody td {
          text-align: center !important;
          vertical-align: middle !important;
        }
        table.dataTable thead th {
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          padding: 0.75rem 1rem !important;
        }
        table.dataTable tbody td {
          padding: 0.75rem 1rem !important;
        }
      `)
      .appendTo("head");

    if (tableRef.current) {
      $(tableRef.current).DataTable({
        processing: true,
        serverSide: true,
        ajax: ajaxUrl,
        columns,
        columnDefs: [
          {
            targets: "_all",
            className: "dt-center",
          },
        ],
      });
    }
  }, [columns, ajaxUrl]);

  return <table ref={tableRef} className="min-w-full divide-y divide-gray-200" />;
};

export default DataTable;
