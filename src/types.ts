export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Only used during auth checks
  fullName: string;
  email: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  subject: string;
}

export interface Hall {
  id: string;
  name: string;
  rows: number;
  columns: number;
  capacity: number;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  subjects: string[];
}

export interface SeatAllocation {
  studentId: string | null; // null if empty
  row: number;
  col: number;
  student?: Student;
}

export interface HallAllocation {
  hallId: string;
  hallName: string;
  seats: SeatAllocation[][]; // 2D array [row][col]
}

export interface AllocationResult {
  id: string;
  examId: string;
  timestamp: number;
  hallAllocations: HallAllocation[];
  unallocatedStudents: Student[];
}




