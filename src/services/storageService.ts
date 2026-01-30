import { Student, Hall, Exam, AllocationResult, AdminUser } from '@/types';

const STORAGE_KEYS = {
  STUDENTS: 'ses_students',
  HALLS: 'ses_halls',
  EXAMS: 'ses_exams',
  ALLOCATIONS: 'ses_allocations',
  USERS: 'ses_admins',
};

export const StorageService = {
  getAdmins: (): AdminUser[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  saveAdmin: (user: AdminUser) => {
    const admins = StorageService.getAdmins();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...admins, user]));
  },

  getStudents: (): Student[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
  saveStudents: (students: Student[]) =>
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)),

  getHalls: (): Hall[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.HALLS) || '[]'),
  saveHalls: (halls: Hall[]) => localStorage.setItem(STORAGE_KEYS.HALLS, JSON.stringify(halls)),

  getExams: (): Exam[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]'),
  saveExams: (exams: Exam[]) => localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams)),

  getAllocations: (): AllocationResult[] =>
    JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || '[]'),
  saveAllocation: (allocation: AllocationResult) => {
    const existing = StorageService.getAllocations();
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify([allocation, ...existing]));
  },

  clearAll: () => Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key)),
};




