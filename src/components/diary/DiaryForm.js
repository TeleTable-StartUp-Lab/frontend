import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { X, FileText } from 'lucide-react';

const DiaryForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [text, setText] = useState('');
  const [workingMinutes, setWorkingMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setText(initialData.text);
      setWorkingMinutes(initialData.working_minutes);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        text,
        working_minutes: parseInt(workingMinutes, 10)
      };

      if (initialData) {
        payload.id = initialData.id;
      }

      await api.post('/diary', payload);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Failed to save entry. Please try again.');
      setLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-[60]">
      <div className="relative glass-panel border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {initialData ? 'Edit Diary Entry' : 'New Diary Entry'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Activity Description</label>
            <textarea
              required
              rows={6}
              className="block w-full border border-white/10 rounded-xl bg-dark-800/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:bg-dark-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm p-4 transition-all"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you work on today? (Markdown supported: **bold**, - list, `code`)"
            />
            <p className="mt-2 text-xs text-gray-500">
              Supports Markdown: **bold**, *italic*, - lists, `code`
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Working Minutes</label>
            <input
              type="number"
              required
              min="1"
              className="block w-full border border-white/10 rounded-xl bg-dark-800/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:bg-dark-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm p-4 transition-all"
              value={workingMinutes}
              onChange={(e) => setWorkingMinutes(e.target.value)}
              placeholder="e.g. 90"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-white/10 text-sm font-medium rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent text-sm font-bold rounded-xl text-dark-900 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]"
            >
              {loading ? 'Saving...' : (initialData ? 'Update Entry' : 'Save Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modal, document.body);
};

export default DiaryForm;