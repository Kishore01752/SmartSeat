import React, { useState, useEffect } from 'react';
import { Student, Hall, Exam, AllocationResult, AdminUser } from '@/types';
import { StorageService } from '@/services/storageService';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ExamManager from '@/components/ExamManager';
import HallManager from '@/components/HallManager';
import StudentManager from '@/components/StudentManager';
import AllocationView from '@/components/AllocationView';
import { LogIn, ShieldAlert, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [allocations, setAllocations] = useState<AllocationResult[]>([]);

  // Auth/Signup States
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
  });
  const [authError, setAuthError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load data on mount
  useEffect(() => {
    setStudents(StorageService.getStudents());
    setHalls(StorageService.getHalls());
    setExams(StorageService.getExams());
    setAllocations(StorageService.getAllocations());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admins = StorageService.getAdmins();
    const user = admins.find(
      (a) => a.username === formData.username && a.password === formData.password
    );

    // For demo purposes, allow admin/admin if no users exist yet
    const isDefaultAdmin =
      admins.length === 0 && formData.username === 'admin' && formData.password === 'admin';

    if (user || isDefaultAdmin) {
      setIsAuthenticated(true);
      setCurrentUser(
        user || { id: 'default', username: 'admin', fullName: 'Default Admin', email: 'admin@system.local' }
      );
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Please check your username and password.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (formData.password !== formData.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    const admins = StorageService.getAdmins();
    if (admins.some((a) => a.username === formData.username)) {
      setAuthError('Username already taken.');
      return;
    }

    const newUser: AdminUser = {
      id: `admin-${Date.now()}`,
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      email: formData.email,
    };

    StorageService.saveAdmin(newUser);
    setSuccessMsg('Account created successfully! You can now log in.');
    setIsSigningUp(false);
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const updateStudents = (newList: Student[]) => {
    const updated = [...students, ...newList];
    setStudents(updated);
    StorageService.saveStudents(updated);
  };

  const clearStudents = () => {
    setStudents([]);
    StorageService.saveStudents([]);
  };

  const addHall = (hall: Hall) => {
    const updated = [...halls, hall];
    setHalls(updated);
    StorageService.saveHalls(updated);
  };

  const deleteHall = (id: string) => {
    const updated = halls.filter((h) => h.id !== id);
    setHalls(updated);
    StorageService.saveHalls(updated);
  };

  const addExam = (exam: Exam) => {
    const updated = [...exams, exam];
    setExams(updated);
    StorageService.saveExams(updated);
  };

  const deleteExam = (id: string) => {
    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    StorageService.saveExams(updated);
  };

  const handleAllocated = (result: AllocationResult) => {
    setAllocations((prev) => [result, ...prev]);
    StorageService.saveAllocation(result);
  };

  const subjects = Array.from(new Set(students.map((s) => s.subject)));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-900 overflow-y-auto">
        <div className="max-w-md w-full my-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-500/20 mb-4">
              S
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">SmartSeat</h1>
            <p className="text-slate-400 text-sm font-medium">Exam Seating Allocation System</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              {isSigningUp ? (
                <>
                  <UserPlus size={24} className="text-indigo-400" /> Create Administrator Account
                </>
              ) : (
                <>
                  <LogIn size={24} className="text-indigo-400" /> Administrative Access
                </>
              )}
            </h2>

            <form onSubmit={isSigningUp ? handleSignup : handleLogin} className="space-y-4">
              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-xs font-medium animate-shake">
                  <ShieldAlert size={16} />
                  {authError}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-3 text-xs font-medium">
                  <CheckCircle size={16} />
                  {successMsg}
                </div>
              )}

              {isSigningUp && (
                <>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setSuccessMsg('');
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setSuccessMsg('');
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      placeholder="jane@college.edu"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setSuccessMsg('');
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="admin_jane"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setSuccessMsg('');
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              {isSigningUp && (
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      setSuccessMsg('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group active:scale-[0.98] mt-4"
              >
                {isSigningUp ? (
                  <>
                    <UserPlus size={18} /> Register Account
                  </>
                ) : (
                  <>
                    <LogIn size={18} /> Authenticate
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <button
                onClick={() => {
                  setIsSigningUp(!isSigningUp);
                  setAuthError('');
                  setSuccessMsg('');
                }}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                {isSigningUp ? (
                  <>
                    <ArrowLeft size={14} /> Back to Login
                  </>
                ) : (
                  <>Don't have an account? Create one</>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-500 text-[10px] mt-8 font-medium">
            &copy; 2024 SmartSeat Enterprise. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }}
    >
      {activeTab === 'dashboard' && (
        <Dashboard students={students} halls={halls} exams={exams} allocations={allocations} />
      )}

      {activeTab === 'exams' && (
        <ExamManager
          exams={exams}
          subjects={subjects}
          onAdd={addExam}
          onDelete={deleteExam}
        />
      )}

      {activeTab === 'halls' && <HallManager halls={halls} onAdd={addHall} onDelete={deleteHall} />}

      {activeTab === 'students' && (
        <StudentManager students={students} onUpload={updateStudents} onClear={clearStudents} />
      )}

      {activeTab === 'allocation' && (
        <AllocationView
          exams={exams}
          halls={halls}
          students={students}
          allocations={allocations}
          onAllocated={handleAllocated}
        />
      )}
    </Layout>
  );
};

export default App;




