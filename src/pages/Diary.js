import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DiaryList from '../components/diary/DiaryList';
import DiaryForm from '../components/diary/DiaryForm';
import { Plus } from 'lucide-react';

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = async () => {
    try {
      const response = await api.get('/diary');
      setEntries(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load diary entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await api.delete('/diary', { data: { id } });
      fetchEntries();
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchEntries();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Project Diary</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-800 bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Entry
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DiaryList entries={entries} onDelete={handleDelete} />
      )}

      {showForm && (
        <DiaryForm
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Diary;