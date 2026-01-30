import React from 'react';
import { Users, School, CalendarRange, CheckCircle2, Activity, ArrowUpRight } from 'lucide-react';
import { Student, Hall, Exam, AllocationResult } from '@/types';

interface DashboardProps {
  students: Student[];
  halls: Hall[];
  exams: Exam[];
  allocations: AllocationResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, halls, exams, allocations }) => {
  const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);
  const recentExams = [...exams].reverse().slice(0, 3);

  const stats = [
    { label: 'Registered Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Available Halls', value: halls.length, icon: School, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Seat Capacity', value: totalCapacity, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Scheduled Exams', value: exams.length, icon: CalendarRange, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-slate-300">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Exam Schedules</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                    {exam.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{exam.name}</h4>
                    <p className="text-sm text-slate-500">
                      {exam.date} • {exam.subjects.length} Subjects
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 size={14} />
                  Confirmed
                </div>
              </div>
            ))}
            {recentExams.length === 0 && (
              <div className="p-12 text-center text-slate-400">No exams scheduled yet.</div>
            )}
          </div>
        </div>

        {/* System Health / Quick Info */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200">
          <h3 className="text-xl font-bold mb-6">Allocation Health</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium opacity-90">
                <span>Hall Utilization</span>
                <span>{halls.length > 0 ? 'Optimal' : 'N/A'}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-3/4"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium opacity-90">
                <span>Subject Diversity</span>
                <span>High</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-full"></div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <p className="text-xs opacity-70 leading-relaxed">
                The SmartSeat algorithm is currently running version 2.4. Mixing weights are biased towards subject separation to prevent cheating and improve fairness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




