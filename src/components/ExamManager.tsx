import React, { useState } from 'react';
import { CalendarRange, Plus, Trash2, BookOpen, AlertCircle, Tag } from 'lucide-react';
import { Exam } from '@/types';

interface ExamManagerProps {
  exams: Exam[];
  subjects: string[];
  onAdd: (exam: Exam) => void;
  onDelete: (id: string) => void;
}

const ExamManager: React.FC<ExamManagerProps> = ({ exams, subjects, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Combine derived subjects from students with any custom ones the user might have added locally
  const allAvailableSubjects = Array.from(new Set([...subjects, ...selectedSubjects]));

  const handleAddCustomSubject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects((prev) => [...prev, customSubject.trim()]);
      setCustomSubject('');
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) {
      setError('Please fill in both Exam Name and Date.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setError('Please select or add at least one subject for this exam session.');
      return;
    }

    onAdd({
      id: `exam-${Date.now()}`,
      name,
      date,
      subjects: selectedSubjects,
    });

    // Reset form
    setName('');
    setDate('');
    setSelectedSubjects([]);
    setError('');
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) => (prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]));
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CalendarRange size={20} className="text-indigo-600" />
          Schedule New Examination Session
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name</label>
              <input
                type="text"
                placeholder="e.g. Mid-Term Fall 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Select Subjects (Students from these subjects will be mixed)
            </label>

            {/* Manual Entry for Subjects */}
            <div className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Add custom subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject(e as any);
                    }
                  }}
                />
              </div>
              <button
                onClick={handleAddCustomSubject}
                type="button"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[60px]">
              {allAvailableSubjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubject(sub)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    selectedSubjects.includes(sub)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
              {allAvailableSubjects.length === 0 && (
                <p className="text-slate-400 text-sm italic">
                  No subjects available. Add one manually or upload students.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus size={20} />
            Create Exam Session
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-indigo-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{exam.name}</h4>
                  <p className="text-sm text-slate-500">
                    {new Date(exam.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDelete(exam.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2"
                title="Delete Exam"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-2 mt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Subjects in this session:
              </p>
              <div className="flex flex-wrap gap-1">
                {exam.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamManager;




