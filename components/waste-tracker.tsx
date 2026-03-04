'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface WasteEntry {
  id: string;
  date: string;
  category: string;
  weight: number;
  isRecycled: boolean;
  timestamp: number;
}

const WASTE_CATEGORIES = [
  { value: 'plastic', label: 'Plastic', color: '#3b82f6', icon: '♻️' },
  { value: 'paper', label: 'Paper', color: '#f59e0b', icon: '📄' },
  { value: 'glass', label: 'Glass', color: '#8b5cf6', icon: '🔷' },
  { value: 'metal', label: 'Metal', color: '#6b7280', icon: '⚙️' },
  { value: 'organic', label: 'Organic', color: '#10b981', icon: '🌿' },
  { value: 'electronic', label: 'Electronic', color: '#ec4899', icon: '🔌' },
];

export function WasteTracker() {
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('plastic');
  const [isRecycled, setIsRecycled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedEntries = localStorage.getItem('ecotrack_entries');
        if (savedEntries) {
          const parsed = JSON.parse(savedEntries);
          setEntries(Array.isArray(parsed) ? parsed : []);
        }
        setIsLoaded(true);
      }
    } catch (e) {
      console.error('Failed to load entries:', e);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('ecotrack_entries', JSON.stringify(entries));
      } catch (e) {
        console.error('Failed to save entries:', e);
      }
    }
  }, [entries, isLoaded]);

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight (must be positive)');
      return;
    }

    if (weightNum > 500) {
      setError('Weight seems too high. Please check the value.');
      return;
    }

    const newEntry: WasteEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      weight: weightNum,
      isRecycled,
      timestamp: Date.now(),
    };

    setEntries([...entries, newEntry]);
    setWeight('');
    setError('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const clearAllEntries = () => {
    if (confirm('Are you sure you want to delete all entries?')) {
      setEntries([]);
    }
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.date === today);
    const total = todayEntries.reduce((sum, e) => sum + e.weight, 0);
    const recycled = todayEntries.reduce((sum, e) => sum + (e.isRecycled ? e.weight : 0), 0);

    return {
      total: parseFloat(total.toFixed(2)),
      recycled: parseFloat(recycled.toFixed(2)),
      notRecycled: parseFloat((total - recycled).toFixed(2)),
      count: todayEntries.length,
      percentage: total > 0 ? Math.round((recycled / total) * 100) : 0,
    };
  };

  const getAllTimeStats = () => {
    const total = entries.reduce((sum, e) => sum + e.weight, 0);
    const recycled = entries.reduce((sum, e) => sum + (e.isRecycled ? e.weight : 0), 0);

    return {
      total: parseFloat(total.toFixed(2)),
      recycled: parseFloat(recycled.toFixed(2)),
      percentage: total > 0 ? Math.round((recycled / total) * 100) : 0,
    };
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: { weight: number; recycled: number } } = {};

    entries.forEach(e => {
      if (!stats[e.category]) {
        stats[e.category] = { weight: 0, recycled: 0 };
      }
      stats[e.category].weight += e.weight;
      if (e.isRecycled) {
        stats[e.category].recycled += e.weight;
      }
    });

    return Object.entries(stats)
      .map(([cat, data]) => ({
        name: WASTE_CATEGORIES.find(c => c.value === cat)?.label || cat,
        value: parseFloat(data.weight.toFixed(2)),
        recycled: parseFloat(data.recycled.toFixed(2)),
        color: WASTE_CATEGORIES.find(c => c.value === cat)?.color || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getWeeklyStats = () => {
    const stats: { [key: string]: { total: number; recycled: number } } = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayEntries = entries.filter(e => e.date === dateStr);
      const total = dayEntries.reduce((sum, e) => sum + e.weight, 0);
      const recycled = dayEntries.reduce((sum, e) => sum + (e.isRecycled ? e.weight : 0), 0);
      stats[day] = { total: parseFloat(total.toFixed(2)), recycled: parseFloat(recycled.toFixed(2)) };
    }

    return Object.entries(stats).map(([day, data]) => ({
      day,
      total: data.total,
      recycled: data.recycled,
      notRecycled: parseFloat((data.total - data.recycled).toFixed(2)),
    }));
  };

  const todayStats = getTodayStats();
  const allTimeStats = getAllTimeStats();
  const categoryStats = getCategoryStats();
  const weeklyStats = getWeeklyStats();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading EcoTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-3 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <span className="text-3xl md:text-4xl">🌍</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">EcoTrack</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 ml-10 md:ml-11">Track urban waste and build sustainable habits</p>
        </div>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <Card className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-emerald-100">
            <div className="flex flex-col items-start">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Today</p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 mt-2">{todayStats.total}</p>
              <p className="text-xs md:text-sm text-emerald-600 font-medium mt-1">kg waste</p>
              <span className="text-2xl mt-2">🗑️</span>
            </div>
          </Card>

          <Card className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-green-100">
            <div className="flex flex-col items-start">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recycled</p>
              <p className="text-xl md:text-3xl font-bold text-green-600 mt-2">{todayStats.recycled}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">{todayStats.percentage}%</p>
              <span className="text-2xl mt-2">♻️</span>
            </div>
          </Card>

          <Card className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-blue-100">
            <div className="flex flex-col items-start">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Entries</p>
              <p className="text-xl md:text-3xl font-bold text-blue-600 mt-2">{entries.length}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">tracked</p>
              <span className="text-2xl mt-2">📊</span>
            </div>
          </Card>

          <Card className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-purple-100">
            <div className="flex flex-col items-start">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total</p>
              <p className="text-xl md:text-3xl font-bold text-purple-600 mt-2">{allTimeStats.total}</p>
              <p className="text-xs md:text-sm text-purple-600 font-medium mt-1">{allTimeStats.percentage}%</p>
              <span className="text-2xl mt-2">🏆</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Input Section - Mobile Sticky */}
          <div className="lg:col-span-1">
            <Card className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 sticky top-3 md:top-4 z-10">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Log Waste</h2>
              <form onSubmit={addEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WASTE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={weight}
                    onChange={e => {
                      setWeight(e.target.value);
                      setError('');
                    }}
                    placeholder="0.5"
                    className="w-full text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use positive numbers</p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={isRecycled}
                    onChange={e => setIsRecycled(e.target.checked)}
                    id="recycled"
                    className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="recycled" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                    Will recycle
                  </label>
                </div>

                {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 text-base">
                  + Add Entry
                </Button>
              </form>

              {/* Recent Entries */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Recent</h3>
                  {entries.length > 0 && (
                    <button
                      onClick={clearAllEntries}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {entries.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No entries yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {entries
                      .slice()
                      .reverse()
                      .slice(0, 10)
                      .map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">
                              {WASTE_CATEGORIES.find(c => c.value === entry.category)?.icon} {WASTE_CATEGORIES.find(c => c.value === entry.category)?.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {entry.weight} kg {entry.isRecycled && '✓'}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {/* Weekly Trend */}
            <Card className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Weekly Trend</h2>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="px-4 md:px-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value: any) => `${value} kg`}
                      />
                      <Bar dataKey="recycled" fill="#10b981" radius={[6, 6, 0, 0]} name="Recycled" />
                      <Bar dataKey="notRecycled" fill="#ef4444" radius={[6, 6, 0, 0]} name="Not Recycled" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Category Distribution */}
            {categoryStats.length > 0 && (
              <Card className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">By Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}kg`}
                          outerRadius={65}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value.toFixed(2)} kg`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col justify-center space-y-2">
                    {categoryStats.map(stat => (
                      <div key={stat.name} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                          <span className="font-semibold text-gray-900">{stat.name}</span>
                        </div>
                        <div className="text-xs text-gray-600 ml-5">
                          <p>Total: <span className="font-semibold">{stat.value.toFixed(2)} kg</span></p>
                          <p>Recycled: <span className="font-semibold text-green-600">{stat.recycled.toFixed(2)} kg</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
