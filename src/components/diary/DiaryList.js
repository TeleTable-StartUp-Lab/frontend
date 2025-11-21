import React from 'react';
import { Trash2, Clock, Calendar } from 'lucide-react';

const DiaryList = ({ entries, onDelete }) => {
  if (!entries.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No diary entries yet. Start tracking your work!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {entries.map((entry) => (
          <li key={entry.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {entry.text}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <div className="flex items-center mr-6">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>{entry.working_minutes} min</p>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>{new Date(entry.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DiaryList;