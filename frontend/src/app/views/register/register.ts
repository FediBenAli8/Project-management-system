import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FuleUploader } from '../../components/fule-uploader/fule-uploader';
import * as UC from '@uploadcare/file-uploader';
import "@uploadcare/file-uploader/web/uc-file-uploader-regular.min.css"


export interface RegisterReq {
  username: string;
  email: string;
  password: string;
  role: string;
  picture_url: string;
}
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FuleUploader],
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
    role: "team_leader",
    picture_url: ""
  }
  selectedFiles: UC.OutputFileEntry<'success'>[] = [];
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.userDataForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['team_leader', Validators.required],
      picture_url: ['']
    });
  }

  get f() {
    return this.userDataForm.controls;
  }
  onImageUploaded(url: string) {
    console.log("Received image URL:", url);
    // Update the picture_url control in your existing FormGroup
    this.userDataForm.patchValue({
      picture_url: url
    });
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
      role: this.userDataForm.value.role,
      picture_url: this.userDataForm.value.picture_url
    }
    if (this.userDataForm.value.picture_url) {
      this.user.picture_url = this.userDataForm.value.picture_url;
    } else {
      this.user.picture_url = "";
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
