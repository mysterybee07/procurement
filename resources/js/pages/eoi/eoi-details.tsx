import React from 'react';
interface Product {
    id:number;
    name: string;
    unit: string;
    specifications:string;
    category: {
        category_name: string;
    };
}

interface RequestItem {
    required_quantity: number;
    product: Product;
}

interface Requisition {
    request_items: RequestItem[];
}

interface Documents{
    id:number;
    name:string;
}
interface Eoi {
  id: number;
  eoi_number: number;
  title: string;
  description:string;
  evaluation_criteria:string;
  created_at: string;
  submission_deadline: string;
  status: string;
  requisitions: Requisition[];
  created_by: {
    name: string;
  };
  documents: Documents[];
}

interface EOIProps {
  eoi: Eoi;
  flash: {
    message?: string;
    error?: string;
  };
  organizationName: string;
  organizationAddress: string;
}

export default function ViewEoi({ eoi, flash, organizationName, organizationAddress }: EOIProps) {
  console.log(eoi);

  // Helper function to format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  // Collect all unique request items across all requisitions
  const getAggregatedRequestItems = () => {
    const itemMap = new Map();
  
    eoi.requisitions.forEach((requisition) => {
      requisition.request_items.forEach((item) => {
        const productKey = item.product.id; 
  
        if (itemMap.has(productKey)) {
          itemMap.get(productKey).required_quantity += item.required_quantity;
        } else {
          itemMap.set(productKey, { ...item });
        }
      });
    });
  
    return Array.from(itemMap.values());
  };
  
  // Get aggregated items
  const aggregatedItems = getAggregatedRequestItems();
  

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">{eoi.title}</h1>

        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold">EOI Number: </span>
            <span>{eoi.eoi_number}</span>
          </div>
          <div>
            <span className="font-semibold">Publish Date: </span>
            <span>{formatDate(eoi.created_at)}</span>
          </div>
        </div>

        <div className="text-center mb-2">
          <span className="font-semibold text-2xl">Whetstone Associates</span>
          <span></span>
        </div>

        <div className="text-center mb-4">
          <span className="font-semibold">Sankhamul, Kathmandu</span>
          {/* <span></span> */}
        </div>
      </header>

      {/* Introduction Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="mb-2">
          {organizationName} invites qualified suppliers to submit an Expression of Interest (EOI)
          for {eoi.title}. This EOI aims to identify potential suppliers who may participate in the
          detailed Request for Proposal (RFP) process.
        </p>

        <h2 className="text-xl font-semibold mb-3 mt-4">2. Description</h2>
        <p className="mb-2">
          {eoi.description}
        </p>

        <h2 className="text-xl font-semibold mb-3 mt-4">3. Required Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Item Name</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Unit</th>
                <th className="p-2 border">Specifications</th>
                {/* <th className="p-2 border">Requester</th> */}
              </tr>
            </thead>
            <tbody>
              {aggregatedItems.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 border">{item.product.name}</td>
                  <td className="p-2 border text-center">{item.required_quantity}</td>
                  <td className="p-2 border text-center">{item.product.unit}</td>
                  <td className="p-2 border">{item.product.specifications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Evaluation Criteria</h2>
        <p className="mb-2">Responses will be evaluated based on the following criteria:</p>
        <ul className="pl-6 list-disc">
          {eoi.evaluation_criteria}
        </ul>
      </section>

      {/* Required Documents */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Required Documents</h2>
        <p className="mb-2">Suppliers must submit the following documents:</p>
        
        {eoi.documents && eoi.documents.length > 0 ? (
            <ol className="pl-6 list-disc">
            {eoi.documents.map((document, index) => (
                <li key={index}>{document.name}</li>
            ))}
            </ol>
        ) : (
            <p className="pl-6 italic text-gray-500">No documents required.</p>
        )}
        </section>
      {/* Submission Deadline */}
      <div className="mb-6 p-4 bg-gray-100 rounded  text-red-600">
        <span className="font-semibold">Submission Deadline: </span>
        <span>{formatDate(eoi.submission_deadline)}</span>
      </div>

      
    </div>
  );
}

// const EOITemplate: React.FC<EOITemplateProps> = ({ 
//   eoi,
//   organizationName, 
//   organizationAddress
// })
  


// export default EOITemplate;

// Example usage:
// This is how you would use the component in another file
/*
import EOITemplate from './EOITemplate';

// Sample data based on your provided structure
const sampleData = {
  id: 1,
  eoi_number: 20250001,
  title: "Supply of Office Equipment",
  created_at: "2025-03-15T10:00:00Z",
  submission_deadline: "2025-04-15T23:59:59Z",
  status: "Open",
  requisitions: [
    {
      requester: {
        name: "IT Department"
      },
      request_items: [
        {
          required_quantity: 20,
          product: {
            name: "Desktop Computer",
            unit: "Unit",
            category: {
              category_name: "IT Equipment"
            }
          }
        },
        {
          required_quantity: 10,
          product: {
            name: "Laser Printer",
            unit: "Unit",
            category: {
              category_name: "IT Equipment"
            }
          }
        }
      ]
    },
    {
      requester: {
        name: "HR Department"
      },
      request_items: [
        {
          required_quantity: 5,
          product: {
            name: "Office Desk",
            unit: "Piece",
            category: {
              category_name: "Furniture"
            }
          }
        }
      ]
    }
  ],
  created_by: {
    name: "Procurement Team"
  }
};

function App() {
  return (
    <EOITemplate 
      eoiData={sampleData}
      organizationName="ABC Corporation"
      organizationAddress="123 Business Street, Tech City, 12345"
    />
  );
}
*/