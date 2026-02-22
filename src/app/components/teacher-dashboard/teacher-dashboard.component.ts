import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalAuthService } from '../../services/local-auth.service';
import { DataService } from '../../services/data.service';
import { Class, Assignment, Submission, Announcement } from '../../models/user.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  currentUser = this.authService.getCurrentUser();
  
  myClasses: Class[] = [];
  myAssignments: Assignment[] = [];
  allSubmissions: Submission[] = [];
  pendingSubmissions: Submission[] = [];
  gradedSubmissions: Submission[] = [];
  myAnnouncements: Announcement[] = [];
  
  activeTab: 'assignments' | 'submissions' | 'announcements' = 'assignments';
  searchAssignments = '';
  
  // Dialogs
  showAssignmentDialog = false;
  showAnnouncementDialog = false;
  editingAssignment: Assignment | null = null;
  editingAnnouncement: Announcement | null = null;
  
  // Forms
  assignmentForm = {
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    fileUrl: ''
  };
  
  announcementForm = {
    title: '',
    content: '',
    targetType: 'all' as 'all' | 'class' | 'specific'
  };
  
  selectedClassIds: string[] = [];
  selectedStudentIds: string[] = [];
  gradeForm: { [key: string]: { marks: number; feedback: string } } = {};
  selectedFile: File | null = null;
  
  // Profile
  showProfileDialog = false;
  showPasswordSection = false;
  profileForm = {
    name: '',
    email: '',
    department: '',
    phone: '',
    address: ''
  };
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: LocalAuthService,
    private dataService: DataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.currentUser) return;
    
    const allClasses = this.dataService.getClasses();
    this.myClasses = allClasses.filter(c => 
      c.teacherIds?.includes(this.currentUser!.id) || c.teacherId === this.currentUser!.id
    );
    
    const allAssignments = this.dataService.getAssignments();
    this.myAssignments = allAssignments.filter(a => a.teacherId === this.currentUser!.id);
    
    const allSubmissions = this.dataService.getSubmissions();
    this.allSubmissions = allSubmissions.filter(s => 
      this.myAssignments.some(a => a.id === s.assignmentId)
    );
    
    this.pendingSubmissions = this.allSubmissions.filter(s => 
      s.status === 'submitted' || s.status === 'late'
    );
    
    this.gradedSubmissions = this.allSubmissions.filter(s => s.status === 'graded');
    
    const allAnnouncements = this.dataService.getAnnouncements();
    this.myAnnouncements = allAnnouncements.filter(a => a.teacherId === this.currentUser!.id);
    
    // Initialize grade form
    this.allSubmissions.forEach(s => {
      if (!this.gradeForm[s.id]) {
        this.gradeForm[s.id] = { marks: s.marks || 0, feedback: s.feedback || '' };
      }
    });
  }

  // Assignment Management
  openCreateAssignmentDialog(): void {
    this.editingAssignment = null;
    this.assignmentForm = {
      title: '',
      description: '',
      classId: '',
      dueDate: '',
      fileUrl: ''
    };
    this.selectedFile = null;
    this.showAssignmentDialog = true;
  }

  editAssignment(assignment: Assignment): void {
    this.editingAssignment = assignment;
    this.assignmentForm = {
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      dueDate: this.formatDateForInput(assignment.dueDate),
      fileUrl: assignment.fileUrl || ''
    };
    this.selectedFile = null;
    this.showAssignmentDialog = true;
  }

  confirmAssignmentDialog(): void {
    if (!this.assignmentForm.title || !this.assignmentForm.classId || !this.assignmentForm.dueDate) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    // Handle file upload simulation (in real app, upload to storage)
    let fileUrl = this.assignmentForm.fileUrl;
    if (this.selectedFile) {
      fileUrl = `uploads/assignments/${Date.now()}_${this.selectedFile.name}`;
    }

    if (this.editingAssignment) {
      // Update existing assignment
      this.dataService.updateAssignment(this.editingAssignment.id, {
        title: this.assignmentForm.title,
        description: this.assignmentForm.description,
        classId: this.assignmentForm.classId,
        dueDate: new Date(this.assignmentForm.dueDate),
        fileUrl: fileUrl
      });
      this.snackBar.open('Assignment updated successfully', 'Close', { duration: 3000 });
    } else {
      // Create new assignment
      this.dataService.createAssignment({
        title: this.assignmentForm.title,
        description: this.assignmentForm.description,
        classId: this.assignmentForm.classId,
        teacherId: this.currentUser!.id,
        dueDate: new Date(this.assignmentForm.dueDate),
        fileUrl: fileUrl
      });
      this.snackBar.open('Assignment created successfully', 'Close', { duration: 3000 });
    }

    this.loadData();
    this.cancelAssignmentDialog();
  }

  cancelAssignmentDialog(): void {
    this.showAssignmentDialog = false;
    this.editingAssignment = null;
    this.assignmentForm = { title: '', description: '', classId: '', dueDate: '', fileUrl: '' };
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.snackBar.open(`File selected: ${file.name}`, 'Close', { duration: 2000 });
    }
  }

  deleteAssignment(assignmentId: string): void {
    if (confirm('Are you sure you want to delete this assignment? All submissions will also be deleted.')) {
      this.dataService.deleteAssignment(assignmentId);
      this.loadData();
      this.snackBar.open('Assignment deleted', 'Close', { duration: 3000 });
    }
  }

  // Submission Management
  gradeSubmission(submissionId: string): void {
    const grade = this.gradeForm[submissionId];
    if (grade.marks === undefined || grade.marks < 0 || grade.marks > 100) {
      this.snackBar.open('Please provide valid marks (0-100)', 'Close', { duration: 3000 });
      return;
    }
    if (!grade.feedback || grade.feedback.trim() === '') {
      this.snackBar.open('Please provide feedback', 'Close', { duration: 3000 });
      return;
    }

    this.dataService.gradeSubmission(submissionId, grade.feedback, grade.marks);
    this.loadData();
    this.snackBar.open('Submission graded successfully', 'Close', { duration: 3000 });
  }

  // Announcement Management
  openCreateAnnouncementDialog(): void {
    this.editingAnnouncement = null;
    this.announcementForm = {
      title: '',
      content: '',
      targetType: 'all'
    };
    this.selectedClassIds = [];
    this.selectedStudentIds = [];
    this.showAnnouncementDialog = true;
  }

  editAnnouncement(announcement: Announcement): void {
    this.editingAnnouncement = announcement;
    this.announcementForm = {
      title: announcement.title,
      content: announcement.content,
      targetType: announcement.targetType
    };
    this.selectedClassIds = [...announcement.classIds];
    this.selectedStudentIds = announcement.studentIds ? [...announcement.studentIds] : [];
    this.showAnnouncementDialog = true;
  }

  confirmAnnouncementDialog(): void {
    if (!this.announcementForm.title || !this.announcementForm.content) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }

    let classIds: string[] = [];
    let studentIds: string[] = [];

    if (this.announcementForm.targetType === 'all') {
      classIds = this.myClasses.map(c => c.id);
    } else if (this.announcementForm.targetType === 'class') {
      classIds = this.selectedClassIds;
      if (classIds.length === 0) {
        this.snackBar.open('Please select at least one class', 'Close', { duration: 3000 });
        return;
      }
    } else if (this.announcementForm.targetType === 'specific') {
      studentIds = this.selectedStudentIds;
      if (studentIds.length === 0) {
        this.snackBar.open('Please select at least one student', 'Close', { duration: 3000 });
        return;
      }
    }

    if (this.editingAnnouncement) {
      // Update existing announcement
      this.dataService.deleteAnnouncement(this.editingAnnouncement.id);
      this.dataService.createAnnouncement({
        ...this.announcementForm,
        teacherId: this.currentUser!.id,
        classIds,
        studentIds
      });
      this.snackBar.open('Announcement updated successfully', 'Close', { duration: 3000 });
    } else {
      // Create new announcement
      this.dataService.createAnnouncement({
        ...this.announcementForm,
        teacherId: this.currentUser!.id,
        classIds,
        studentIds
      });
      this.snackBar.open('Announcement posted successfully', 'Close', { duration: 3000 });
    }

    this.loadData();
    this.cancelAnnouncementDialog();
  }

  cancelAnnouncementDialog(): void {
    this.showAnnouncementDialog = false;
    this.editingAnnouncement = null;
    this.announcementForm = { title: '', content: '', targetType: 'all' };
    this.selectedClassIds = [];
    this.selectedStudentIds = [];
  }

  deleteAnnouncement(announcementId: string): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.dataService.deleteAnnouncement(announcementId);
      this.loadData();
      this.snackBar.open('Announcement deleted', 'Close', { duration: 3000 });
    }
  }

  toggleClassSelection(classId: string): void {
    const index = this.selectedClassIds.indexOf(classId);
    if (index > -1) {
      this.selectedClassIds.splice(index, 1);
    } else {
      this.selectedClassIds.push(classId);
    }
  }

  toggleStudentSelection(studentId: string): void {
    const index = this.selectedStudentIds.indexOf(studentId);
    if (index > -1) {
      this.selectedStudentIds.splice(index, 1);
    } else {
      this.selectedStudentIds.push(studentId);
    }
  }

  getMyStudents(): any[] {
    const allUsers = this.authService.getAllUsers();
    const studentIds = new Set<string>();
    
    // Get all students from my classes
    this.myClasses.forEach(cls => {
      cls.studentIds.forEach(sid => studentIds.add(sid));
    });
    
    return allUsers.filter(u => u.role === 'student' && studentIds.has(u.id));
  }

  // Helper Methods
  getClassName(classId: string): string {
    const cls = this.myClasses.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown Class';
  }

  getAssignmentTitle(assignmentId: string): string {
    const assignment = this.myAssignments.find(a => a.id === assignmentId);
    return assignment ? assignment.title : 'Unknown Assignment';
  }

  getStudentName(studentId: string): string {
    const allUsers = this.authService.getAllUsers();
    const student = allUsers.find(u => u.id === studentId);
    return student ? student.name : 'Unknown Student';
  }

  getSubmissionCount(assignmentId: string): number {
    return this.allSubmissions.filter(s => s.assignmentId === assignmentId).length;
  }

  isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  getSubmissionBadgeClass(status: string): string {
    switch (status) {
      case 'graded':
        return 'status-graded';
      case 'submitted':
        return 'status-submitted';
      case 'late':
        return 'status-late';
      default:
        return 'status-pending';
    }
  }

  getFilteredAssignments(): Assignment[] {
    if (!this.searchAssignments) return this.myAssignments;
    const search = this.searchAssignments.toLowerCase();
    return this.myAssignments.filter(a => 
      a.title.toLowerCase().includes(search) ||
      a.description.toLowerCase().includes(search) ||
      this.getClassName(a.classId).toLowerCase().includes(search)
    );
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  viewProfile(): void {
    if (this.currentUser) {
      this.profileForm = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        department: this.currentUser.department || '',
        phone: (this.currentUser as any).phone || '',
        address: (this.currentUser as any).address || ''
      };
      this.showProfileDialog = true;
      this.showPasswordSection = false;
    }
  }

  cancelProfileDialog(): void {
    this.showProfileDialog = false;
    this.showPasswordSection = false;
    this.profileForm = { name: '', email: '', department: '', phone: '', address: '' };
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  confirmProfileDialog(): void {
    if (!this.profileForm.name || !this.profileForm.email) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profileForm.email)) {
      this.snackBar.open('Please enter a valid email address', 'Close', { duration: 3000 });
      return;
    }

    if (this.currentUser) {
      this.authService.updateUser(this.currentUser.id, {
        name: this.profileForm.name,
        email: this.profileForm.email,
        department: this.profileForm.department,
        phone: this.profileForm.phone,
        address: this.profileForm.address
      });
      
      // Reload current user
      this.currentUser = this.authService.getCurrentUser();
      this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      this.cancelProfileDialog();
    }
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }
  }

  changePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.snackBar.open('Please fill all password fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.snackBar.open('New password must be at least 6 characters', 'Close', { duration: 3000 });
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.snackBar.open('New passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    if (this.currentUser) {
      const success = this.authService.changePassword(
        this.currentUser.email,
        this.passwordForm.currentPassword,
        this.passwordForm.newPassword
      );

      if (success) {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.showPasswordSection = false;
      } else {
        this.snackBar.open('Current password is incorrect', 'Close', { duration: 3000 });
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
