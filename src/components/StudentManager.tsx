import React, { useState } from 'react';
import { Upload, Search, Users, Trash2, FileText, Download } from 'lucide-react';
import { Student } from '@/types';

interface StudentManagerProps {
  students: Student[];
  onUpload: (newStudents: Student[]) => void;
  onClear: () => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ students, onUpload, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      const results: Student[] = [];

      // Simple CSV parser logic (Skip header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [rollNo, name, department, subject] = line
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''));
        if (rollNo && name) {
          results.push({
            id: `std-${Date.now()}-${i}`,
            rollNo,
            name,
            department,
            subject,
          });
        }
      }
      onUpload(results);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent =
      'Roll No,Name,Department,Subject\n2023CS001,John Doe,Computer Science,Data Structures\n2023ME042,Jane Smith,Mechanical,Thermodynamics\n2023EC015,Mike Ross,Electronics,Signals & Systems';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Batch Upload Students</h3>
          <p className="text-slate-500 mb-6 max-w-xs">
            Upload your student registry in CSV format to populate the system database.
          </p>

          <div className="flex gap-3">
            <label className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 cursor-pointer transition-all font-semibold flex items-center gap-2">
              <FileText size={18} />
              Choose CSV File
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={downloadTemplate}
              className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-semibold flex items-center gap-2"
            >
              <Download size={18} />
              Template
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Student Statistics</h3>
            <p className="text-slate-500 mb-6">Current active registry overview.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Total Students</p>
                <p className="text-3xl font-black text-indigo-600">{students.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Departments</p>
                <p className="text-3xl font-black text-slate-800">
                  {new Set(students.map((s) => s.department)).size}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClear}
            className="w-full mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 py-3 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Purge Registry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Student Directory</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, roll no or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Current Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600">{s.rollNo}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4 text-slate-600">{s.department}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                      {s.subject}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-20" />
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManager;




