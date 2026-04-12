import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userDataForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.userDataForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f() {
    return this.userDataForm.controls;
  }

  onSubmit() {
    this.userDataForm.markAllAsTouched();
    if (this.userDataForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      this.auth.register();//this.userDataForm.value.name || 'User'
      this.isSubmitting = false;
      this.router.navigate(['/']);
    }, 500);
  }
}
