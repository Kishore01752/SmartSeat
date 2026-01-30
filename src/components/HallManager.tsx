import React, { useState } from 'react';
import { Plus, Trash2, LayoutGrid, School } from 'lucide-react';
import { Hall } from '@/types';

interface HallManagerProps {
  halls: Hall[];
  onAdd: (hall: Hall) => void;
  onDelete: (id: string) => void;
}

const HallManager: React.FC<HallManagerProps> = ({ halls, onAdd, onDelete }) => {
  const [newHall, setNewHall] = useState<Partial<Hall>>({
    name: '',
    rows: 10,
    columns: 6,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHall.name && newHall.rows && newHall.columns) {
      onAdd({
        id: `hall-${Date.now()}`,
        name: newHall.name,
        rows: Number(newHall.rows),
        columns: Number(newHall.columns),
        capacity: Number(newHall.rows) * Number(newHall.columns),
      });
      setNewHall({ name: '', rows: 10, columns: 6 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} className="text-indigo-600" />
          Add New Examination Hall
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hall Name/Number</label>
            <input
              type="text"
              required
              placeholder="e.g. Hall 101"
              value={newHall.name}
              onChange={(e) => setNewHall({ ...newHall, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rows</label>
            <input
              type="number"
              required
              min="1"
              value={newHall.rows}
              onChange={(e) => setNewHall({ ...newHall, rows: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Columns</label>
            <input
              type="number"
              required
              min="1"
              value={newHall.columns}
              onChange={(e) => setNewHall({ ...newHall, columns: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Hall
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <div
            key={hall.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-800">{hall.name}</h4>
                <p className="text-sm text-slate-500">Capacity: {hall.capacity} seats</p>
              </div>
              <button
                onClick={() => onDelete(hall.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <LayoutGrid size={16} />
                <span>
                  Layout: {hall.rows} rows × {hall.columns} columns
                </span>
              </div>

              {/* Visual Preview */}
              <div
                className="mt-4 grid gap-1 border border-slate-100 p-2 rounded-lg bg-slate-50 overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${Math.min(hall.columns, 10)}, 1fr)` }}
              >
                {Array.from({ length: Math.min(hall.rows * hall.columns, 50) }).map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-200 rounded-sm opacity-50"></div>
                ))}
                {hall.rows * hall.columns > 50 && (
                  <div className="col-span-full text-[10px] text-center text-slate-400">
                    Preview limited to 50 seats
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {halls.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <School size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No halls added yet. Use the form above to get started.</p>
        </div>
      )}
    </div>
  );
};

export default HallManager;




