import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalAuthService } from '../../services/local-auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  roles: UserRole[] = ['student', 'teacher'];
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: LocalAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['student', [Validators.required]],
      department: ['', [Validators.required]],
      rollNo: ['']
    });

    // Add conditional validation for rollNo
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const rollNoControl = this.registerForm.get('rollNo');
      if (role === 'student') {
        rollNoControl?.setValidators([
          Validators.required, 
          this.notZeroValidator, 
          this.uniqueRollNumberValidator
        ]);
      } else {
        rollNoControl?.clearValidators();
      }
      rollNoControl?.updateValueAndValidity();
    });
  }

  // Custom validator to ensure roll number is not 0 and is a valid positive integer
  notZeroValidator = (control: any) => {
    // Skip validation if field is empty (let required validator handle it)
    if (control.value === '' || control.value === null || control.value === undefined) {
      return null;
    }

    const inputValue = control.value.toString().trim();
    
    // Check if value is a valid number
    if (isNaN(inputValue) || inputValue === '') {
      return { notZero: true };
    }

    const numericValue = parseInt(inputValue, 10);

    // Explicitly reject 0 value
    if (numericValue === 0) {
      return { notZero: true };
    }

    // Reject negative numbers
    if (numericValue < 0) {
      return { notZero: true };
    }

    // Valid positive roll number
    return null;
  }

  // Custom validator to ensure roll number is unique
  uniqueRollNumberValidator = (control: any) => {
    if (control.value === '' || control.value === null) {
      return null;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingRollNo = users.find((u: any) => u.rollNo === control.value);
    return existingRollNo ? { duplicateRollNo: true } : null;
  }

  get isStudent(): boolean {
    return this.registerForm.get('role')?.value === 'student';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.registerForm.value;
    const userData = {
      name: formValue.name,
      email: formValue.email,
      role: formValue.role,
      department: formValue.department,
      rollNo: formValue.role === 'student' ? formValue.rollNo : undefined
    };

    const success = this.authService.register(userData, formValue.password);

    if (success) {
      this.snackBar.open('Registration successful! Please wait for admin approval.', 'Close', { duration: 3000 });
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } else {
      this.snackBar.open('Email already exists', 'Close', { duration: 3000 });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
