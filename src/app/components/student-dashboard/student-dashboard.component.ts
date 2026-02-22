import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalAuthService } from '../../services/local-auth.service';
import { DataService } from '../../services/data.service';
import { User, Class, Assignment, Submission, Announcement } from '../../models/user.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  currentUser = this.authService.getCurrentUser();
  
  myClasses: Class[] = [];
  allAssignments: Assignment[] = [];
  pendingAssignments: Assignment[] = [];
  submittedAssignments: Assignment[] = [];
  mySubmissions: Submission[] = [];
  gradedSubmissions: Submission[] = [];
  myAnnouncements: Announcement[] = [];
  
  activeTab: 'assignments' | 'grades' | 'announcements' = 'assignments';
  searchQuery = '';
  unreadAnnouncementCount = 0;
  viewedAnnouncements: string[] = [];
  
  // Dialogs
  showSubmitDialog = false;
  showEditDialog = false;
  showProfileDialog = false;
  selectedAssignment: Assignment | null = null;
  selectedSubmission: Submission | null = null;
  
  // Forms
  submissionForm = {
    content: '',
    fileUrl: ''
  };
  
  profileForm = {
    name: '',
    email: '',
    rollNo: '',
    department: '',
    phone: '',
    address: ''
  };
  
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  showPasswordSection = false;
  selectedFile: File | null = null;

  constructor(
    private authService: LocalAuthService,
    private dataService: DataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadViewedAnnouncements();
  }

  loadData(): void {
    if (!this.currentUser) return;
    
    const allClasses = this.dataService.getClasses();
    this.myClasses = allClasses.filter(c => c.studentIds.includes(this.currentUser!.id));
    
    const myClassIds = this.myClasses.map(c => c.id);
    const allAssignments = this.dataService.getAssignments();
    this.allAssignments = allAssignments.filter(a => myClassIds.includes(a.classId));
    
    const allSubmissions = this.dataService.getSubmissions();
    this.mySubmissions = allSubmissions.filter(s => s.studentId === this.currentUser!.id);
    
    const submittedAssignmentIds = this.mySubmissions.map(s => s.assignmentId);
    this.pendingAssignments = this.allAssignments.filter(a => 
      !submittedAssignmentIds.includes(a.id) && !this.isOverdue(a.dueDate)
    );
    
    this.submittedAssignments = this.allAssignments.filter(a => 
      submittedAssignmentIds.includes(a.id)
    );
    
    this.gradedSubmissions = this.mySubmissions.filter(s => s.status === 'graded');
    
    const allAnnouncements = this.dataService.getAnnouncements();
    this.myAnnouncements = allAnnouncements.filter(a => 
      a.targetType === 'all' || 
      a.classIds.some(cId => myClassIds.includes(cId)) ||
      (a.studentIds && a.studentIds.includes(this.currentUser!.id))
    );
    
    this.updateUnreadCount();
  }

  loadViewedAnnouncements(): void {
    if (!this.currentUser) return;
    const key = `viewed_announcements_${this.currentUser.id}`;
    const viewed = localStorage.getItem(key);
    this.viewedAnnouncements = viewed ? JSON.parse(viewed) : [];
  }

  saveViewedAnnouncements(): void {
    if (!this.currentUser) return;
    const key = `viewed_announcements_${this.currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(this.viewedAnnouncements));
  }

  updateUnreadCount(): void {
    this.unreadAnnouncementCount = this.myAnnouncements.filter(a => 
      !this.viewedAnnouncements.includes(a.id)
    ).length;
  }

  markAnnouncementsAsRead(): void {
    this.myAnnouncements.forEach(a => {
      if (!this.viewedAnnouncements.includes(a.id)) {
        this.viewedAnnouncements.push(a.id);
      }
    });
    this.saveViewedAnnouncements();
    this.updateUnreadCount();
  }

  onTabChange(tab: 'assignments' | 'grades' | 'announcements'): void {
    this.activeTab = tab;
    if (tab === 'announcements') {
      this.markAnnouncementsAsRead();
    }
  }

  // Assignment Submission
  openSubmitDialog(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.submissionForm = { content: '', fileUrl: '' };
    this.selectedFile = null;
    this.showSubmitDialog = true;
  }

  openEditDialog(assignment: Assignment): void {
    const submission = this.getSubmissionStatus(assignment.id);
    if (!submission) return;
    
    this.selectedAssignment = assignment;
    this.selectedSubmission = submission;
    this.submissionForm = {
      content: submission.content,
      fileUrl: submission.fileUrl || ''
    };
    this.selectedFile = null;
    this.showEditDialog = true;
  }

  cancelSubmitDialog(): void {
    this.showSubmitDialog = false;
    this.selectedAssignment = null;
    this.submissionForm = { content: '', fileUrl: '' };
    this.selectedFile = null;
  }

  cancelEditDialog(): void {
    this.showEditDialog = false;
    this.selectedAssignment = null;
    this.selectedSubmission = null;
    this.submissionForm = { content: '', fileUrl: '' };
    this.selectedFile = null;
  }

  confirmSubmitDialog(): void {
    if (!this.submissionForm.content.trim()) {
      this.snackBar.open('Please provide your solution', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedAssignment) return;

    let fileUrl = this.submissionForm.fileUrl;
    if (this.selectedFile) {
      fileUrl = `uploads/submissions/${Date.now()}_${this.selectedFile.name}`;
    }

    const assignment = this.selectedAssignment;
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const status = now > dueDate ? 'late' : 'submitted';

    this.dataService.submitAssignment({
      assignmentId: assignment.id,
      studentId: this.currentUser!.id,
      content: this.submissionForm.content,
      fileUrl: fileUrl,
      status: status
    });

    this.loadData();
    this.cancelSubmitDialog();
    this.snackBar.open('Assignment submitted successfully', 'Close', { duration: 3000 });
  }

  confirmEditDialog(): void {
    if (!this.submissionForm.content.trim()) {
      this.snackBar.open('Please provide your solution', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedSubmission) return;

    let fileUrl = this.submissionForm.fileUrl;
    if (this.selectedFile) {
      fileUrl = `uploads/submissions/${Date.now()}_${this.selectedFile.name}`;
    }

    this.dataService.updateSubmission(this.selectedSubmission.id, {
      content: this.submissionForm.content,
      fileUrl: fileUrl
    });

    this.loadData();
    this.cancelEditDialog();
    this.snackBar.open('Submission updated successfully', 'Close', { duration: 3000 });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      this.snackBar.open(`File selected: ${file.name}`, 'Close', { duration: 2000 });
    }
  }

  // Profile
  viewProfile(): void {
    if (this.currentUser) {
      this.profileForm = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        rollNo: this.currentUser.rollNo || '',
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
    this.profileForm = { name: '', email: '', rollNo: '', department: '', phone: '', address: '' };
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  confirmProfileDialog(): void {
    if (!this.profileForm.name || !this.profileForm.email) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.currentUser) {
      this.authService.updateUser(this.currentUser.id, {
        name: this.profileForm.name,
        email: this.profileForm.email,
        rollNo: this.profileForm.rollNo,
        department: this.profileForm.department,
        phone: this.profileForm.phone,
        address: this.profileForm.address
      });
      
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

  // Helper Methods
  getClassName(classId: string): string {
    const cls = this.myClasses.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown Class';
  }

  getClassDepartment(classId: string): string {
    const cls = this.myClasses.find(c => c.id === classId);
    return cls ? cls.department : '';
  }

  getTeacherName(teacherId?: string): string {
    if (!teacherId) return 'Not assigned';
    const allUsers = this.authService.getAllUsers();
    const teacher = allUsers.find(u => u.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  }

  getSubmissionStatus(assignmentId: string): Submission | null {
    return this.mySubmissions.find(s => s.assignmentId === assignmentId) || null;
  }

  isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  canEditSubmission(assignment: Assignment): boolean {
    return !this.isOverdue(assignment.dueDate);
  }

  getAverageGrade(): number {
    if (this.gradedSubmissions.length === 0) return 0;
    const total = this.gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);
    return Math.round(total / this.gradedSubmissions.length);
  }

  getAssignmentById(assignmentId: string): Assignment | undefined {
    return this.allAssignments.find(a => a.id === assignmentId);
  }

  getFilteredAssignments(): Assignment[] {
    if (!this.searchQuery) return this.pendingAssignments;
    const search = this.searchQuery.toLowerCase();
    return this.pendingAssignments.filter(a => 
      a.title.toLowerCase().includes(search) ||
      a.description.toLowerCase().includes(search) ||
      this.getClassName(a.classId).toLowerCase().includes(search)
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
