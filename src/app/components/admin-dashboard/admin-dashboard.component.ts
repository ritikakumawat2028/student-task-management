import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalAuthService } from '../../services/local-auth.service';
import { DataService } from '../../services/data.service';
import { User, Class } from '../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser = this.authService.getCurrentUser();
  
  // User lists
  pendingUsers: User[] = [];
  allTeachers: User[] = [];
  allStudents: User[] = [];
  approvedTeachers: User[] = [];
  approvedStudents: User[] = [];
  
  // Classes
  classes: Class[] = [];
  
  // Active tab
  activeTab: 'pending' | 'teachers' | 'students' | 'classes' = 'pending';
  
  // Search filters
  searchPending = '';
  searchTeachers = '';
  searchStudents = '';
  searchClasses = '';
  
  // Dialogs
  showCreateClassForm = false;
  showAssignTeacherDialog = false;
  showEditUserDialog = false;
  showAssignStudentsDialog = false;
  showProfileDialog = false;
  selectedClassId = '';
  selectedTeacherId = '';
  selectedTeacherIds: string[] = [];
  selectedStudentIds: string[] = [];
  
  // Edit user data
  editUserData: any = {};
  editUserId = '';
  
  // Profile
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
  
  showPasswordSection = false;
  
  // Create class form
  newClass = {
    name: '',
    department: ''
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
    const allUsers = this.authService.getAllUsers();
    this.pendingUsers = allUsers.filter(u => u.status === 'pending');
    this.allTeachers = allUsers.filter(u => u.role === 'teacher');
    this.allStudents = allUsers.filter(u => u.role === 'student');
    this.approvedTeachers = this.allTeachers.filter(u => u.status === 'approved');
    this.approvedStudents = this.allStudents.filter(u => u.status === 'approved');
    this.classes = this.dataService.getClasses();
  }

  // User management
  approveUser(userId: string): void {
    this.authService.approveUser(userId);
    this.loadData();
    this.snackBar.open('User approved successfully', 'Close', { duration: 3000 });
  }

  rejectUser(userId: string): void {
    this.authService.rejectUser(userId);
    this.loadData();
    this.snackBar.open('User rejected', 'Close', { duration: 3000 });
  }

  blockUser(userId: string): void {
    this.authService.blockUser(userId);
    this.loadData();
    this.snackBar.open('User blocked', 'Close', { duration: 3000 });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId);
      this.loadData();
      this.snackBar.open('User deleted', 'Close', { duration: 3000 });
    }
  }

  // Class management
  openCreateClassDialog(): void {
    this.showCreateClassForm = true;
  }

  createClass(): void {
    if (!this.newClass.name || !this.newClass.department) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }

    this.dataService.createClass(this.newClass);
    this.loadData();
    this.showCreateClassForm = false;
    this.newClass = { name: '', department: '' };
    this.snackBar.open('Class created successfully', 'Close', { duration: 3000 });
  }

  cancelCreateClass(): void {
    this.showCreateClassForm = false;
    this.newClass = { name: '', department: '' };
  }

  assignTeacher(classId: string, teacherId: string): void {
    if (!teacherId) return;
    this.dataService.assignTeacherToClass(classId, teacherId);
    this.loadData();
    this.snackBar.open('Teacher assigned successfully', 'Close', { duration: 3000 });
  }

  assignStudentToClass(studentId: string, classId: string): void {
    this.dataService.assignStudentToClass(studentId, classId);
    this.loadData();
    this.snackBar.open('Student enrolled successfully', 'Close', { duration: 3000 });
  }

  deleteClass(classId: string): void {
    if (confirm('Are you sure you want to delete this class?')) {
      this.dataService.deleteClass(classId);
      this.loadData();
      this.snackBar.open('Class deleted', 'Close', { duration: 3000 });
    }
  }

  // Helper methods
  getTeacherName(teacherId?: string): string {
    if (!teacherId) return '';
    const teacher = this.allTeachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : '';
  }

  getStatusBadgeClass(status: string): string {
    const baseClass = 'badge ';
    switch (status) {
      case 'approved':
        return baseClass + 'badge-success';
      case 'pending':
        return baseClass + 'badge-warning';
      case 'rejected':
        return baseClass + 'badge-error';
      case 'blocked':
        return baseClass + 'badge-error';
      default:
        return baseClass + 'badge-default';
    }
  }

  // Filter methods
  getFilteredPendingUsers(): User[] {
    if (!this.searchPending) return this.pendingUsers;
    const search = this.searchPending.toLowerCase();
    return this.pendingUsers.filter(u => 
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.department?.toLowerCase().includes(search) ||
      u.rollNo?.toLowerCase().includes(search)
    );
  }

  getFilteredTeachers(): User[] {
    const activeTeachers = this.allTeachers.filter(t => t.status !== 'blocked');
    if (!this.searchTeachers) return activeTeachers;
    const search = this.searchTeachers.toLowerCase();
    return activeTeachers.filter(t => 
      t.name.toLowerCase().includes(search) ||
      t.email.toLowerCase().includes(search) ||
      t.department?.toLowerCase().includes(search)
    );
  }

  getFilteredStudents(): User[] {
    const activeStudents = this.allStudents.filter(s => s.status !== 'blocked');
    if (!this.searchStudents) return activeStudents;
    const search = this.searchStudents.toLowerCase();
    return activeStudents.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.department?.toLowerCase().includes(search) ||
      s.rollNo?.toLowerCase().includes(search)
    );
  }

  getFilteredClasses(): Class[] {
    if (!this.searchClasses) return this.classes;
    const search = this.searchClasses.toLowerCase();
    return this.classes.filter(c => 
      c.name.toLowerCase().includes(search) ||
      c.department.toLowerCase().includes(search)
    );
  }

  getBlockedTeachers(): User[] {
    return this.allTeachers.filter(t => t.status === 'blocked');
  }

  // Teacher assignment
  selectClassForTeacher(classId: string): void {
    this.selectedClassId = classId;
    this.selectedTeacherId = '';
    this.showAssignTeacherDialog = true;
  }

  openAssignTeachersDialog(classId: string): void {
    this.selectedClassId = classId;
    const classData = this.classes.find(c => c.id === classId);
    this.selectedTeacherIds = classData?.teacherIds ? [...classData.teacherIds] : [];
    this.showAssignTeacherDialog = true;
  }

  isTeacherInClass(teacherId: string): boolean {
    return this.selectedTeacherIds.includes(teacherId);
  }

  toggleTeacherSelection(teacherId: string): void {
    const index = this.selectedTeacherIds.indexOf(teacherId);
    if (index > -1) {
      this.selectedTeacherIds.splice(index, 1);
    } else {
      this.selectedTeacherIds.push(teacherId);
    }
  }

  confirmAssignTeachers(): void {
    if (!this.selectedClassId) return;

    const classData = this.classes.find(c => c.id === this.selectedClassId);
    if (classData) {
      // Initialize teacherIds if not exists
      if (!classData.teacherIds) {
        classData.teacherIds = [];
      }

      // Remove teachers that are no longer selected
      const teachersToRemove = classData.teacherIds.filter(id => !this.selectedTeacherIds.includes(id));
      teachersToRemove.forEach(teacherId => {
        this.dataService.removeTeacherFromClass(this.selectedClassId, teacherId);
      });

      // Add newly selected teachers
      this.selectedTeacherIds.forEach(teacherId => {
        if (!classData.teacherIds.includes(teacherId)) {
          this.dataService.assignTeacherToClass(this.selectedClassId, teacherId);
        }
      });
    }

    this.loadData();
    this.cancelAssignTeacher();
    this.snackBar.open('Teachers assigned successfully', 'Close', { duration: 3000 });
  }

  confirmAssignTeacher(): void {
    if (this.selectedTeacherId && this.selectedClassId) {
      this.assignTeacher(this.selectedClassId, this.selectedTeacherId);
      this.cancelAssignTeacher();
    }
  }

  removeTeacherFromClass(classId: string, teacherId: string): void {
    if (confirm('Remove this teacher from the class?')) {
      this.dataService.removeTeacherFromClass(classId, teacherId);
      this.loadData();
      this.snackBar.open('Teacher removed from class', 'Close', { duration: 3000 });
    }
  }

  cancelAssignTeacher(): void {
    this.showAssignTeacherDialog = false;
    this.selectedClassId = '';
    this.selectedTeacherId = '';
    this.selectedTeacherIds = [];
  }

  getClassTeacherIds(classData: Class): string[] {
    if (classData.teacherIds && classData.teacherIds.length > 0) {
      return classData.teacherIds;
    }
    // Fallback to single teacherId for backward compatibility
    if (classData.teacherId) {
      return [classData.teacherId];
    }
    return [];
  }

  // Unblock user
  unblockUser(userId: string): void {
    this.authService.approveUser(userId);
    this.loadData();
    this.snackBar.open('User unblocked successfully', 'Close', { duration: 3000 });
  }

  // Edit user
  openEditUserDialog(user: User): void {
    this.editUserId = user.id;
    this.editUserData = {
      name: user.name,
      email: user.email,
      department: user.department || '',
      rollNo: user.rollNo || '',
      role: user.role
    };
    this.showEditUserDialog = true;
  }

  confirmEditUser(): void {
    if (!this.editUserData.name || !this.editUserData.email) {
      this.snackBar.open('Name and email are required', 'Close', { duration: 3000 });
      return;
    }

    this.authService.updateUser(this.editUserId, {
      name: this.editUserData.name,
      email: this.editUserData.email,
      department: this.editUserData.department,
      rollNo: this.editUserData.rollNo
    });

    this.loadData();
    this.cancelEditUser();
    this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
  }

  cancelEditUser(): void {
    this.showEditUserDialog = false;
    this.editUserId = '';
    this.editUserData = {};
  }

  // Assign multiple students
  openAssignStudentsDialog(classId: string): void {
    this.selectedClassId = classId;
    const classData = this.classes.find(c => c.id === classId);
    this.selectedStudentIds = classData ? [...classData.studentIds] : [];
    this.showAssignStudentsDialog = true;
  }

  isStudentInClass(studentId: string): boolean {
    return this.selectedStudentIds.includes(studentId);
  }

  toggleStudentSelection(studentId: string): void {
    const index = this.selectedStudentIds.indexOf(studentId);
    if (index > -1) {
      this.selectedStudentIds.splice(index, 1);
    } else {
      this.selectedStudentIds.push(studentId);
    }
  }

  confirmAssignStudents(): void {
    if (!this.selectedClassId) return;

    const classData = this.classes.find(c => c.id === this.selectedClassId);
    if (classData) {
      // Remove students that are no longer selected
      const studentsToRemove = classData.studentIds.filter(id => !this.selectedStudentIds.includes(id));
      studentsToRemove.forEach(studentId => {
        const index = classData.studentIds.indexOf(studentId);
        if (index > -1) {
          classData.studentIds.splice(index, 1);
        }
      });

      // Add newly selected students
      this.selectedStudentIds.forEach(studentId => {
        if (!classData.studentIds.includes(studentId)) {
          this.dataService.assignStudentToClass(studentId, this.selectedClassId);
        }
      });
    }

    this.loadData();
    this.cancelAssignStudents();
    this.snackBar.open('Students assigned successfully', 'Close', { duration: 3000 });
  }

  cancelAssignStudents(): void {
    this.showAssignStudentsDialog = false;
    this.selectedClassId = '';
    this.selectedStudentIds = [];
  }

  // Profile Management
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
