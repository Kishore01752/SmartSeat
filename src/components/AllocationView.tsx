import React, { useState } from 'react';
/* Added missing ClipboardList icon import */
import {
  Play,
  Printer,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { Exam, Hall, Student, AllocationResult } from '@/types';
import { allocateSeating } from '@/services/allocationEngine';
import * as XLSX from 'xlsx';

interface AllocationViewProps {
  exams: Exam[];
  halls: Hall[];
  students: Student[];
  allocations: AllocationResult[];
  onAllocated: (result: AllocationResult) => void;
}

const AllocationView: React.FC<AllocationViewProps> = ({ exams, halls, students, allocations, onAllocated }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [spacing, setSpacing] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [expandedAlloc, setExpandedAlloc] = useState<string | null>(null);

  const handleRunAllocation = () => {
    const exam = exams.find((e) => e.id === selectedExamId);
    if (!exam || halls.length === 0) return;

    setIsAllocating(true);
    // Simulate thinking/heavy calculation
    setTimeout(() => {
      const result = allocateSeating(exam, halls, students, { emptySeatSpacing: spacing });
      onAllocated(result);
      setIsAllocating(false);
      setExpandedAlloc(result.id);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = (result: AllocationResult) => {
    let csv = 'Hall,Row,Column,Roll No,Name,Department,Subject\n';
    result.hallAllocations.forEach((ha) => {
      ha.seats.forEach((row) => {
        row.forEach((seat) => {
          if (seat.student) {
            csv += `"${ha.hallName}",${seat.row + 1},${seat.col + 1},"${seat.student.rollNo}","${seat.student.name}","${seat.student.department}","${seat.student.subject}"\n`;
          }
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seating_Plan_${result.examId}.csv`;
    a.click();
  };

  const downloadExcel = (result: AllocationResult) => {
    const wb = XLSX.utils.book_new();
    const exam = exams.find((e) => e.id === result.examId);

    result.hallAllocations.forEach((ha) => {
      // Create a readable grid for Excel
      const gridData: any[][] = [];

      // Add Header Row (Columns)
      const headerRow = ['Row \\ Col'];
      for (let c = 0; c < ha.seats[0].length; c++) {
        headerRow.push(`Column ${c + 1}`);
      }
      gridData.push(headerRow);

      // Add Data Rows
      ha.seats.forEach((row, rIdx) => {
        const rowData: string[] = [`Row ${rIdx + 1}`];
        row.forEach((seat) => {
          if (seat.student) {
            rowData.push(`${seat.student.rollNo}\n${seat.student.name}\n(${seat.student.subject})`);
          } else {
            rowData.push('EMPTY');
          }
        });
        gridData.push(rowData);
      });

      const ws = XLSX.utils.aoa_to_sheet(gridData);

      // Auto-size columns roughly
      const wscols = [{ wch: 12 }];
      for (let i = 0; i < ha.seats[0].length; i++) wscols.push({ wch: 20 });
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, ha.hallName.substring(0, 31)); // Sheet name max 31 chars
    });

    // Add a summary sheet
    const summaryData = [
      ['Exam Name', exam?.name || 'N/A'],
      ['Date', exam?.date || 'N/A'],
      ['Total Allocated', result.hallAllocations.reduce((acc, curr) => acc + curr.seats.flat().filter((s) => s.studentId).length, 0)],
      ['Unallocated', result.unallocatedStudents.length],
      [],
      ['Roll No', 'Name', 'Department', 'Subject', 'Hall', 'Row', 'Column'],
    ];

    result.hallAllocations.forEach((ha) => {
      ha.seats.forEach((row) => {
        row.forEach((seat) => {
          if (seat.student) {
            summaryData.push([
              seat.student.rollNo,
              seat.student.name,
              seat.student.department,
              seat.student.subject,
              ha.hallName,
              seat.row + 1,
              seat.col + 1,
            ]);
          }
        });
      });
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Master List');

    XLSX.writeFile(wb, `Seating_Plan_${exam?.name || 'Exam'}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 no-print">
        <h3 className="text-lg font-semibold mb-6">New Allocation Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-slate-50"
            >
              <option value="">Choose an exam...</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.date})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 h-[42px] mt-6">
            <input
              type="checkbox"
              id="spacing"
              checked={spacing}
              onChange={(e) => setSpacing(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="spacing" className="text-sm text-slate-700 cursor-pointer select-none">
              Empty-seat spacing (Checkerboard)
            </label>
          </div>
          <div className="flex items-end">
            <button
              disabled={!selectedExamId || isAllocating}
              onClick={handleRunAllocation}
              className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                !selectedExamId || isAllocating
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
              }`}
            >
              {isAllocating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  Run Allocation Engine
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {allocations.map((alloc) => {
          const exam = exams.find((e) => e.id === alloc.examId);
          const isExpanded = expandedAlloc === alloc.id;
          const totalAllocated = alloc.hallAllocations.reduce(
            (sum, ha) => sum + ha.seats.flat().filter((s) => s.studentId).length,
            0
          );

          return (
            <div
              key={alloc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300"
            >
              <div className="p-6 flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{exam?.name || 'Unknown Exam'}</h4>
                    <p className="text-sm text-slate-500">
                      Generated on {new Date(alloc.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{totalAllocated} Students Allocated</p>
                    {alloc.unallocatedStudents.length > 0 && (
                      <p className="text-xs text-red-500 font-medium">
                        {alloc.unallocatedStudents.length} Unallocated (Insufficient space)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadExcel(alloc)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                      title="Download Excel (.xlsx)"
                    >
                      <FileSpreadsheet size={20} />
                      <span className="text-[10px] font-bold uppercase hidden md:inline">Excel</span>
                    </button>
                    <button
                      onClick={() => downloadCSV(alloc)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                      title="Download CSV"
                    >
                      <FileText size={20} />
                      <span className="text-[10px] font-bold uppercase hidden md:inline">CSV</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                      title="Print Plan / PDF"
                    >
                      <Printer size={20} />
                      <span className="text-[10px] font-bold uppercase hidden md:inline">Print/PDF</span>
                    </button>
                    <button
                      onClick={() => setExpandedAlloc(isExpanded ? null : alloc.id)}
                      className="p-2 ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {(isExpanded || window.matchMedia('print').matches) && (
                <div className="border-t border-slate-100 p-6 space-y-12">
                  {alloc.hallAllocations.map((ha) => (
                    <div key={ha.hallId} className="page-break">
                      <div className="flex justify-between items-end mb-4">
                        <h5 className="text-xl font-bold text-slate-800 uppercase tracking-wide border-l-4 border-indigo-600 pl-4">
                          {ha.hallName} - Seating Chart
                        </h5>
                        <div className="text-xs text-slate-400">Smart Exam Seating System</div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 bg-slate-50 border border-slate-200 text-xs text-slate-500 font-semibold w-12">
                                R\C
                              </th>
                              {Array.from({ length: ha.seats[0].length }).map((_, c) => (
                                <th
                                  key={c}
                                  className="p-2 bg-slate-50 border border-slate-200 text-xs text-slate-500 font-semibold"
                                >
                                  Column {c + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {ha.seats.map((row, r) => (
                              <tr key={r}>
                                <td className="p-2 bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
                                  Row {r + 1}
                                </td>
                                {row.map((seat, c) => (
                                  <td
                                    key={c}
                                    className={`p-3 border border-slate-200 text-center align-top min-w-[120px] transition-all ${
                                      seat.student ? 'bg-white' : 'bg-slate-50'
                                    }`}
                                  >
                                    {seat.student ? (
                                      <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">
                                          {seat.student.rollNo}
                                        </div>
                                        <div className="text-[11px] font-semibold text-slate-800 leading-tight h-8 overflow-hidden line-clamp-2">
                                          {seat.student.name}
                                        </div>
                                        <div className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 inline-block font-medium truncate max-w-full">
                                          {seat.student.subject}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-300 font-medium italic">EMPTY</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {alloc.unallocatedStudents.length > 0 && (
                    <div className="p-6 bg-red-50 border border-red-100 rounded-xl no-print">
                      <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
                        <AlertCircle size={20} />
                        Unallocated Students
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {alloc.unallocatedStudents.map((s) => (
                          <div key={s.id} className="text-xs bg-white p-2 rounded border border-red-200 shadow-sm">
                            <span className="font-bold text-red-800">{s.rollNo}</span> - {s.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {allocations.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
            <ClipboardList size={64} className="mx-auto text-slate-200 mb-6" />
            <h5 className="text-xl font-semibold text-slate-800">No Allocations Yet</h5>
            <p className="text-slate-500 mt-2">Configure an exam and run the engine to generate seating charts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationView;




