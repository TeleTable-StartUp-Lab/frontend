import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DiaryList from '../components/diary/DiaryList';
import DiaryBarChart from '../components/diary/DiaryBarChart';

const PublicDiary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEntries = async () => {
    try {
      const response = await api.get('/diary/all');
      setEntries(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load diary entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'TeleTable - Public Diary';
    fetchEntries();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl p-6 border border-white/10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Public Diary</h1>
        <div className="text-xs text-gray-400">Read-only</div>
      </div>

      <DiaryBarChart entries={entries} />

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
        <DiaryList entries={entries} readOnly />
      )}
    </div>
  );
};

export default PublicDiary;
