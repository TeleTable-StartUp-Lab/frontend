import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DiaryList from '../components/diary/DiaryList';
import DiaryForm from '../components/diary/DiaryForm';
import { Plus } from 'lucide-react';

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
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
      console.error('Delete error:', err);
      alert('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEntry(null);
    fetchEntries();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl p-6 border border-white/10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Project Diary</h1>
        <button
          type="button"
          onClick={() => {
            setEditingEntry(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-dark-900 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Entry
        </button>
      </div>

      {error && (
        <div className="glass-error rounded-lg p-4">
          <p className="text-danger font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl border border-white/10 flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DiaryList entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      {showForm && (
        <DiaryForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={editingEntry}
        />
      )}
    </div>
  );
};

export default Diary;