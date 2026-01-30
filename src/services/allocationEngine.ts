import { Student, Hall, Exam, AllocationResult, HallAllocation, SeatAllocation } from '@/types';

/**
 * Seating Allocation Rules Engine
 * 1. Mix students from different subjects/departments.
 * 2. Prevent adjacent seats (horizontal & vertical) from having the same subject.
 * 3. Maximize hall usage while respecting capacity.
 */
export const allocateSeating = (
  exam: Exam,
  halls: Hall[],
  allStudents: Student[],
  options: { emptySeatSpacing: boolean } = { emptySeatSpacing: false }
): AllocationResult => {
  // 1. Filter students participating in this exam's subjects
  const examStudents = allStudents.filter((s) => exam.subjects.includes(s.subject));

  // 2. Shuffle students to ensure fairness/randomization
  const shuffledStudents = [...examStudents].sort(() => Math.random() - 0.5);

  // 3. Group students by subject for strategic picking
  const studentsBySubject: Record<string, Student[]> = {};
  exam.subjects.forEach((sub) => {
    studentsBySubject[sub] = shuffledStudents.filter((s) => s.subject === sub);
  });

  const hallAllocations: HallAllocation[] = [];
  const allocatedStudentIds = new Set<string>();
  const unallocatedStudents: Student[] = [];

  // Helper to check if a subject can be placed at (r, c)
  const isConflict = (grid: SeatAllocation[][], r: number, c: number, subject: string): boolean => {
    // Check Top
    if (r > 0 && grid[r - 1][c]?.student?.subject === subject) return true;
    // Check Left
    if (c > 0 && grid[r][c - 1]?.student?.subject === subject) return true;
    // Diagonal checks (optional but recommended for strictly "fair" mixing)
    if (r > 0 && c > 0 && grid[r - 1][c - 1]?.student?.subject === subject) return true;
    if (r > 0 && c < grid[r].length - 1 && grid[r - 1][c + 1]?.student?.subject === subject) return true;

    return false;
  };

  // 4. Process each hall
  for (const hall of halls) {
    const grid: SeatAllocation[][] = Array.from({ length: hall.rows }, (_, r) =>
      Array.from({ length: hall.columns }, (_, c) => ({ row: r, col: c, studentId: null }))
    );

    for (let r = 0; r < hall.rows; r++) {
      for (let c = 0; c < hall.columns; c++) {
        // Respect empty seat spacing option
        if (options.emptySeatSpacing && (r + c) % 2 !== 0) continue;

        // Try to find a student from subjects, prioritizing the one with most students left
        const availableSubjects = Object.keys(studentsBySubject)
          .filter((sub) => studentsBySubject[sub].length > 0)
          .sort((a, b) => studentsBySubject[b].length - studentsBySubject[a].length);

        let placed = false;
        for (const subject of availableSubjects) {
          if (!isConflict(grid, r, c, subject)) {
            const student = studentsBySubject[subject].shift()!;
            grid[r][c] = { row: r, col: c, studentId: student.id, student };
            allocatedStudentIds.add(student.id);
            placed = true;
            break;
          }
        }

        // If conflict-free placement failed but we have students, try greedy fill as last resort if spacing isn't active
        if (!placed && !options.emptySeatSpacing) {
          for (const subject of availableSubjects) {
            const student = studentsBySubject[subject].shift()!;
            grid[r][c] = { row: r, col: c, studentId: student.id, student };
            allocatedStudentIds.add(student.id);
            placed = true;
            break;
          }
        }
      }
    }

    hallAllocations.push({
      hallId: hall.id,
      hallName: hall.name,
      seats: grid,
    });
  }

  // 5. Collect unallocated students
  Object.values(studentsBySubject).forEach((list) => unallocatedStudents.push(...list));

  return {
    id: `alloc-${Date.now()}`,
    examId: exam.id,
    timestamp: Date.now(),
    hallAllocations,
    unallocatedStudents,
  };
};




