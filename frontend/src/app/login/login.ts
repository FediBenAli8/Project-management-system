import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export interface LoginReq {
  email: string;
  password: string;
}
export interface accessToken {
  email: string;
  username: string;
  role: string;
  id: number;
}


export interface loginResponse {
  access_token: accessToken;
  type: string;
}
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  userlog: LoginReq | any = {
    email: "",
    password: ""
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    this.userlog.email = this.loginForm.value.email;
    this.userlog.password = this.loginForm.value.password;

    this.isSubmitting = true;
    setTimeout(() => {
      this.auth.login(this.userlog).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error(error);
        }
      })
    }, 500);
  }
}

