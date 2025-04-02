import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

interface DataTableColumn {
  data: string;
  title: string;
  orderable?: boolean;
  searchable?: boolean;
  className?: string;
  visible?: boolean;
  render?: (data: any, type: any, row: any) => string;
}

interface DataTableProps {
  columns: DataTableColumn[];
  ajaxUrl: string;
  onDrawCallback?: () => void;
  destroy?: boolean;
  id?: string;
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  ajaxUrl, 
  onDrawCallback, 
  destroy = false,
  id = "DataTable"
}) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    // Add custom styles
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
      // Destroy existing instance if needed
      if (destroy && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      // Initialize new DataTable
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
        drawCallback: onDrawCallback
      });
    }

    // Cleanup function
    return () => {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [columns, ajaxUrl, destroy, onDrawCallback]);

  return <table ref={tableRef} id={id} className="min-w-full divide-y divide-gray-200" />;
};

export default DataTable;