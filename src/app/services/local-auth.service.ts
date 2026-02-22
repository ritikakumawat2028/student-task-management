import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // Default admin user (no registration needed)
  private readonly DEFAULT_ADMIN: User = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@school.com',
    role: 'admin',
    status: 'approved',
    classIds: [],
    createdAt: new Date()
  };

  private readonly ADMIN_PASSWORD = 'admin123';

  constructor() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): boolean {
    // Check if it's the admin
    if (email === this.DEFAULT_ADMIN.email && password === this.ADMIN_PASSWORD) {
      this.currentUserSubject.next(this.DEFAULT_ADMIN);
      localStorage.setItem('currentUser', JSON.stringify(this.DEFAULT_ADMIN));
      return true;
    }

    // Check registered users from localStorage
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return false;
    }

    // Check password (stored in separate object for security)
    const passwords = this.getPasswords();
    if (passwords[user.id] !== password) {
      return false;
    }

    // Check if user is approved (except admin)
    if (user.role !== 'admin' && user.status !== 'approved') {
      return false;
    }

    if (user.status === 'blocked') {
      return false;
    }

    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }

  register(userData: Omit<User, 'id' | 'createdAt' | 'status' | 'classIds'>, password: string): boolean {
    const users = this.getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: `${userData.role}-${Date.now()}`,
      status: 'pending',
      classIds: [],
      createdAt: new Date()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Store password separately
    const passwords = this.getPasswords();
    passwords[newUser.id] = password;
    localStorage.setItem('passwords', JSON.stringify(passwords));

    return true;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUsers(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  private getPasswords(): { [key: string]: string } {
    const passwords = localStorage.getItem('passwords');
    return passwords ? JSON.parse(passwords) : {};
  }

  // Admin functions
  getAllUsers(): User[] {
    return [this.DEFAULT_ADMIN, ...this.getUsers()];
  }

  approveUser(userId: string): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = 'approved';
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  rejectUser(userId: string): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = 'rejected';
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  blockUser(userId: string): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = 'blocked';
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filtered));

    const passwords = this.getPasswords();
    delete passwords[userId];
    localStorage.setItem('passwords', JSON.stringify(passwords));
  }

  updateUser(userId: string, userData: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user if editing self
      if (this.currentUserSubject.value?.id === userId) {
        this.currentUserSubject.next(users[index]);
        localStorage.setItem('currentUser', JSON.stringify(users[index]));
      }
    }
  }

  changePassword(email: string, currentPassword: string, newPassword: string): boolean {
    // Check if it's admin
    if (email === this.DEFAULT_ADMIN.email) {
      // For demo purposes, admin password cannot be changed
      // In production, you'd implement proper admin password change
      return false;
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return false;
    }

    // Verify current password
    const passwords = this.getPasswords();
    if (passwords[user.id] !== currentPassword) {
      return false;
    }

    // Update password
    passwords[user.id] = newPassword;
    localStorage.setItem('passwords', JSON.stringify(passwords));
    return true;
  }
}
