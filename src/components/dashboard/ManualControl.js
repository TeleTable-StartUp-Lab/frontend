import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const ManualControl = () => {
  const handleMove = (direction) => {
    console.log(`Moving ${direction}`);
    // Here we would send the command to the backend
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Manual Control</h3>
      <div className="flex flex-col items-center space-y-4">
        <button
          onMouseDown={() => handleMove('forward')}
          onMouseUp={() => handleMove('stop')}
          className="p-4 bg-gray-100 rounded-full hover:bg-primary hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <ArrowUp className="h-8 w-8" />
        </button>
        <div className="flex space-x-4">
          <button
            onMouseDown={() => handleMove('left')}
            onMouseUp={() => handleMove('stop')}
            className="p-4 bg-gray-100 rounded-full hover:bg-primary hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          <button
            onMouseDown={() => handleMove('right')}
            onMouseUp={() => handleMove('stop')}
            className="p-4 bg-gray-100 rounded-full hover:bg-primary hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ArrowRight className="h-8 w-8" />
          </button>
        </div>
        <button
          onMouseDown={() => handleMove('backward')}
          onMouseUp={() => handleMove('stop')}
          className="p-4 bg-gray-100 rounded-full hover:bg-primary hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <ArrowDown className="h-8 w-8" />
        </button>
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        Hold buttons to move
      </p>
    </div>
  );
};

export default ManualControl;