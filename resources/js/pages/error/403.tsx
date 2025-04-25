import React from 'react';
import { Link } from '@inertiajs/react';
import { Lock } from 'lucide-react';

interface ForbiddenPageProps {
  message?: string;
}

const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ 
  message = 'You do not have permission to access this resource.' 
}) => {
  const goBack = () => {
    window.history.length > 1 
      ? window.history.go(-1) 
      : window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-2xl rounded-2xl p-10 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-5 rounded-full">
            <Lock 
              className="h-16 w-16 text-red-500"
              strokeWidth={1.5}
            />
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            403 Forbidden
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            {message}
          </p>
          
          <div className="flex justify-center space-x-4">
            {/* <Link
              href="/"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                         transition duration-300 ease-in-out transform hover:-translate-y-1 
                         shadow-md hover:shadow-lg"
            >
              Return to Home
            </Link> */}
            
            <button 
              onClick={goBack}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg 
                         hover:bg-gray-300 transition duration-300 ease-in-out 
                         transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            >
              Go Back
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>If this seems like an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;