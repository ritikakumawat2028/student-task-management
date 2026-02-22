import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Class, Assignment, Submission, Announcement } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private classesSubject = new BehaviorSubject<Class[]>([]);
  private assignmentsSubject = new BehaviorSubject<Assignment[]>([]);
  private submissionsSubject = new BehaviorSubject<Submission[]>([]);
  private announcementsSubject = new BehaviorSubject<Announcement[]>([]);

  public classes$ = this.classesSubject.asObservable();
  public assignments$ = this.assignmentsSubject.asObservable();
  public submissions$ = this.submissionsSubject.asObservable();
  public announcements$ = this.announcementsSubject.asObservable();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const classes = localStorage.getItem('classes');
    const assignments = localStorage.getItem('assignments');
    const submissions = localStorage.getItem('submissions');
    const announcements = localStorage.getItem('announcements');

    if (classes) this.classesSubject.next(JSON.parse(classes));
    if (assignments) this.assignmentsSubject.next(JSON.parse(assignments));
    if (submissions) this.submissionsSubject.next(JSON.parse(submissions));
    if (announcements) this.announcementsSubject.next(JSON.parse(announcements));
  }

  // Classes
  getClasses(): Class[] {
    return this.classesSubject.value;
  }

  createClass(classData: Omit<Class, 'id' | 'createdAt' | 'studentIds' | 'teacherIds'>): void {
    const classes = this.getClasses();
    const newClass: Class = {
      ...classData,
      id: `class-${Date.now()}`,
      studentIds: [],
      teacherIds: [],
      createdAt: new Date()
    };
    classes.push(newClass);
    this.saveClasses(classes);
  }

  assignTeacherToClass(classId: string, teacherId: string): void {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index !== -1) {
      // Add to teacherIds array if not already present
      if (!classes[index].teacherIds) {
        classes[index].teacherIds = [];
      }
      if (!classes[index].teacherIds.includes(teacherId)) {
        classes[index].teacherIds.push(teacherId);
      }
      // Keep teacherId for backward compatibility
      if (!classes[index].teacherId) {
        classes[index].teacherId = teacherId;
      }
      this.saveClasses(classes);
    }
  }

  removeTeacherFromClass(classId: string, teacherId: string): void {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index !== -1 && classes[index].teacherIds) {
      classes[index].teacherIds = classes[index].teacherIds.filter(id => id !== teacherId);
      // Update primary teacherId if removed
      if (classes[index].teacherId === teacherId) {
        classes[index].teacherId = classes[index].teacherIds[0] || undefined;
      }
      this.saveClasses(classes);
    }
  }

  assignStudentToClass(studentId: string, classId: string): void {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index !== -1 && !classes[index].studentIds.includes(studentId)) {
      classes[index].studentIds.push(studentId);
      this.saveClasses(classes);
    }
  }

  deleteClass(classId: string): void {
    const classes = this.getClasses().filter(c => c.id !== classId);
    this.saveClasses(classes);
  }

  private saveClasses(classes: Class[]): void {
    localStorage.setItem('classes', JSON.stringify(classes));
    this.classesSubject.next(classes);
  }

  // Assignments
  getAssignments(): Assignment[] {
    return this.assignmentsSubject.value;
  }

  createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt'>): void {
    const assignments = this.getAssignments();
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assignment-${Date.now()}`,
      createdAt: new Date()
    };
    assignments.push(newAssignment);
    this.saveAssignments(assignments);
  }

  updateAssignment(assignmentId: string, data: Partial<Assignment>): void {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...data };
      this.saveAssignments(assignments);
    }
  }

  deleteAssignment(assignmentId: string): void {
    const assignments = this.getAssignments().filter(a => a.id !== assignmentId);
    this.saveAssignments(assignments);
    
    // Also delete related submissions
    const submissions = this.getSubmissions().filter(s => s.assignmentId !== assignmentId);
    this.saveSubmissions(submissions);
  }

  private saveAssignments(assignments: Assignment[]): void {
    localStorage.setItem('assignments', JSON.stringify(assignments));
    this.assignmentsSubject.next(assignments);
  }

  // Submissions
  getSubmissions(): Submission[] {
    return this.submissionsSubject.value;
  }

  submitAssignment(submissionData: Omit<Submission, 'id' | 'submittedAt'>): void {
    const submissions = this.getSubmissions();
    const assignment = this.getAssignments().find(a => a.id === submissionData.assignmentId);
    const isLate = assignment && new Date() > new Date(assignment.dueDate);

    const newSubmission: Submission = {
      ...submissionData,
      id: `submission-${Date.now()}`,
      submittedAt: new Date(),
      status: isLate ? 'late' : 'submitted'
    };

    // Check if submission already exists
    const existingIndex = submissions.findIndex(
      s => s.assignmentId === submissionData.assignmentId && s.studentId === submissionData.studentId
    );

    if (existingIndex !== -1) {
      submissions[existingIndex] = newSubmission;
    } else {
      submissions.push(newSubmission);
    }

    this.saveSubmissions(submissions);
  }

  gradeSubmission(submissionId: string, feedback: string, marks: number): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      submissions[index].feedback = feedback;
      submissions[index].marks = marks;
      submissions[index].status = 'graded';
      this.saveSubmissions(submissions);
    }
  }

  updateSubmission(submissionId: string, data: Partial<Submission>): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      submissions[index] = { ...submissions[index], ...data };
      this.saveSubmissions(submissions);
    }
  }

  private saveSubmissions(submissions: Submission[]): void {
    localStorage.setItem('submissions', JSON.stringify(submissions));
    this.submissionsSubject.next(submissions);
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.announcementsSubject.value;
  }

  createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt'>): void {
    const announcements = this.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `announcement-${Date.now()}`,
      createdAt: new Date()
    };
    announcements.push(newAnnouncement);
    this.saveAnnouncements(announcements);
  }

  deleteAnnouncement(announcementId: string): void {
    const announcements = this.getAnnouncements().filter(a => a.id !== announcementId);
    this.saveAnnouncements(announcements);
  }

  private saveAnnouncements(announcements: Announcement[]): void {
    localStorage.setItem('announcements', JSON.stringify(announcements));
    this.announcementsSubject.next(announcements);
  }
}
