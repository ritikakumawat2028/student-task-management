export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  rollNo?: string;
  phone?: string;
  address?: string;
  classIds: string[];
  createdAt: Date;
}

export interface Class {
  id: string;
  name: string;
  department: string;
  teacherId?: string; // Keep for backward compatibility
  teacherIds: string[]; // Multiple teachers support
  studentIds: string[];
  createdAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  classId: string;
  teacherId: string;
  fileUrl?: string;
  createdAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl?: string;
  content: string;
  status: 'pending' | 'submitted' | 'late' | 'graded';
  submittedAt?: Date;
  feedback?: string;
  marks?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  teacherId: string;
  classIds: string[];
  targetType: 'all' | 'class' | 'specific';
  studentIds?: string[];
  createdAt: Date;
}
