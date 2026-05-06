import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


export interface RegisterReq {
  username: string;
  email: string;
  password: string;
  role: string;
}
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
  user: RegisterReq = {
    username: "",
    email: "",
    password: "",
    role: "team_leader"
  }
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.userDataForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['team_leader', Validators.required]
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
    this.user = {
      username: this.userDataForm.value.username,
      email: this.userDataForm.value.email,
      password: this.userDataForm.value.password,
      role: this.userDataForm.value.role
    }
    this.isSubmitting = true;
    this.auth.register(this.user).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error(error);
      }
    });
  }
}
