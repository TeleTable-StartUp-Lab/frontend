import React from 'react';
import { Trash2, Clock, Calendar, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const DiaryList = ({ entries, onDelete, onEdit }) => {
  if (!entries.length) {
    return (
      <div className="text-center py-12 glass-panel rounded-xl border border-white/10">
        <p className="text-gray-400">No diary entries yet. Start tracking your work!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      <ul className="divide-y divide-white/10">
        {entries.map((entry) => (
          <li key={entry.id}>
            <div className="px-6 py-6 hover:bg-white/5 transition duration-150 ease-in-out">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300" style={{ overflowWrap: 'anywhere' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        h1: ({ node, children, ...props }) => <h1 className="text-xl font-bold text-white mt-4 mb-2" {...props}>{children}</h1>,
                        h2: ({ node, children, ...props }) => <h2 className="text-lg font-bold text-white mt-3 mb-2" {...props}>{children}</h2>,
                        h3: ({ node, children, ...props }) => <h3 className="text-md font-bold text-gray-200 mt-2 mb-1" {...props}>{children}</h3>,
                        ul: ({ node, children, ...props }) => <ul className="list-disc list-inside my-2" {...props}>{children}</ul>,
                        ol: ({ node, children, ...props }) => <ol className="list-decimal list-inside my-2" {...props}>{children}</ol>,
                        a: ({ node, children, href, ...props }) => <a href={href} className="text-primary hover:underline" {...props}>{children}</a>,
                      }}
                    >
                      {entry.text}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-6">
                    <div className="flex items-center">
                      <Clock className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-primary" />
                      <p className="font-mono">{entry.working_minutes} min</p>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-secondary" />
                      <p className="font-mono">{new Date(entry.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                    title="Edit entry"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all"
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
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