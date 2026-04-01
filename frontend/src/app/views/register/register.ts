import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userDataForm: FormGroup;
  isSubmitting = false;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Initialize the form structure
    this.userDataForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]// Example default value
    });
  }
  get f() {
    return this.userDataForm.controls;
  }
  onSubmit() {
    // Mark all fields as touched to show validation errors
    this.userDataForm.markAllAsTouched();

    // Stop if form is invalid
    if (this.userDataForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.http.post('http://localhost:8000/api/tasks/', this.userDataForm.value)
      .subscribe({
        next: (response) => {
          console.log('Task created!', response);
          this.userDataForm.reset(); // Clear form
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating task', error);
          this.isSubmitting = false;
        }
      });
  }
}
