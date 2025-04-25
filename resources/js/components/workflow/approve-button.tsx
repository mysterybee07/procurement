import React, { useState } from 'react';
import axios from 'axios';

interface ApproveButtonProps {
  approvalId: number;
  apiRoute: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

const ApproveButton: React.FC<ApproveButtonProps> = ({ 
  approvalId, 
  apiRoute, 
  onSuccess, 
  onError 
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      
      // You can add confirmation dialog here if needed
      const confirmed = window.confirm('Are you sure you want to approve this request?');
      if (!confirmed) {
        setLoading(false);
        return;
      }
      
      // Make API call to approve the request
      const response = await axios.post(apiRoute, {
        approval_id: approvalId,
        action: 'approve'
      });
      
      // Handle success
      if (response.data.success) {
        onSuccess && onSuccess(response.data.message || 'Request approved successfully');
      } else {
        onError && onError(response.data.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      onError && onError('An error occurred while approving the request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium flex items-center"
      onClick={handleApprove}
      disabled={loading}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      )}
      {loading ? 'Processing...' : 'Approve'}
    </button>
  );
};

export default ApproveButton;