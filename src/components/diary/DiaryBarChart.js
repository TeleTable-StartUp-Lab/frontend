import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

const formatLabel = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const formatDay = (date) => date.toLocaleDateString(undefined, { weekday: 'short' });
const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const DiaryBarChart = ({ entries }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [hovered, setHovered] = useState(null);

  const { data, maxMinutes, totalMinutes, avgMinutes } = useMemo(() => {
    const map = new Map();

    (entries || []).forEach((entry) => {
      const date = new Date(entry.created_at || Date.now());
      const dayKey = getLocalDateKey(date);
      const current = map.get(dayKey) || { date, minutes: 0 };
      const minutes = Number(entry.working_minutes) || 0;
      current.minutes += minutes;
      map.set(dayKey, current);
    });

    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);

    const week = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + idx);
      const key = getLocalDateKey(date);
      const item = map.get(key);
      return {
        date,
        minutes: item ? item.minutes : 0,
      };
    });

    const max = week.reduce((max, item) => Math.max(max, item.minutes), 0);
    const total = week.reduce((sum, item) => sum + item.minutes, 0);
    const avg = Math.round(total / 7);

    return { data: week, maxMinutes: max, totalMinutes: total, avgMinutes: avg };
  }, [entries, weekOffset]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Weekly Activity</h2>
              <p className="text-sm text-gray-400 mt-0.5">Working time statistics</p>
            </div>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 text-gray-400 hover:text-primary transition-all"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-gray-400 min-w-[100px] text-center">
              {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} Week${weekOffset > 1 ? 's' : ''}` : `${weekOffset} Week${weekOffset < -1 ? 's' : ''}`}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 text-gray-400 hover:text-primary transition-all"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-500 mb-1">Total Time</div>
            <div className="text-2xl font-bold text-white font-mono">{formatTime(totalMinutes)}</div>
          </div>
          <div className="glass-card rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-500 mb-1">Daily Average</div>
            <div className="text-2xl font-bold text-primary font-mono">{formatTime(avgMinutes)}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-6">
        <div className="relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '240px' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-white/5" />
            ))}
          </div>

          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-600 font-mono" style={{ width: '40px', height: '240px' }}>
            {maxMinutes > 0 && [4, 3, 2, 1, 0].map((i) => {
              const value = Math.round((maxMinutes / 4) * i);
              return (
                <div key={i} className="-mt-2">
                  {value > 0 ? formatTime(value) : '0'}
                </div>
              );
            })}
          </div>

          {/* Bars */}
          <div className="ml-12">
            <div className="flex items-stretch justify-between gap-2 sm:gap-4" style={{ height: '240px' }}>
              {data.map((item) => {
                const heightPct = maxMinutes > 0 ? (item.minutes / maxMinutes) * 100 : 0;
                const showBar = item.minutes > 0;
                // Vergleiche nur das Datum, nicht die Zeit
                const today = new Date();
                const isToday = item.date.getFullYear() === today.getFullYear() && 
                                item.date.getMonth() === today.getMonth() && 
                                item.date.getDate() === today.getDate();
                const isHovered = hovered?.date?.toISOString() === item.date.toISOString();
                
                return (
                  <div key={item.date.toISOString()} className="flex flex-col items-center gap-3 flex-1 h-full">
                    {/* Bar Container */}
                    <div className="relative w-full flex-1 flex items-end justify-center">
                      <div
                        className="relative w-full max-w-[48px] h-full flex items-end justify-center"
                        onMouseEnter={() => setHovered(item)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {/* Bar */}
                        {showBar && (
                          <>
                            <div
                              className={`w-full rounded-t-lg transition-all duration-200 cursor-pointer ${
                                isHovered 
                                  ? 'bg-primary shadow-[0_0_20px_rgba(0,240,255,0.4)]' 
                                  : 'bg-gradient-to-t from-primary/80 to-primary/60'
                              }`}
                              style={{ 
                                height: `${Math.max(8, heightPct)}%`
                              }}
                            />
                            {/* Tooltip */}
                            {isHovered && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                                <div className="glass-panel px-2.5 py-1.5 rounded-md border border-primary/30 shadow-lg">
                                  <span className="text-xs font-bold text-white font-mono">{formatTime(item.minutes)}</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        {!showBar && (
                          <div className="w-full h-1 rounded-t-lg bg-white/5" />
                        )}
                      </div>
                    </div>

                    {/* Day Label */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`text-xs font-medium ${
                        isToday 
                          ? 'text-primary font-bold' 
                          : isHovered 
                            ? 'text-white' 
                            : 'text-gray-500'
                      } transition-colors`}>
                        {formatDay(item.date)}
                      </div>
                      <div className={`text-[10px] ${
                        isToday 
                          ? 'text-primary/70' 
                          : 'text-gray-600'
                      } font-mono`}>
                        {formatLabel(item.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryBarChart;
