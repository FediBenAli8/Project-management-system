import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  pic_url: string = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;
  passwordMessage = '';
  passwordError = '';

  constructor(public auth: AuthService) { }

  getInitials(): string {
    const name = this.auth.userName() || this.auth.email() || 'U';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getRoleLabel(): string {
    const role = String(this.auth.role() || 'User').replace(/_/g, ' ');
    return role.replace(/\b\w/g, letter => letter.toUpperCase());
  }
  getPictureUrl() {
    return this.auth.pictureUrl() || "";
  }

  changePassword(): void {
    this.passwordMessage = '';
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.showPasswordError('Please fill in all password fields.');
      return;
    }

    if (this.newPassword.length < 8) {
      this.showPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showPasswordError('New password and confirmation do not match.');
      return;
    }

    this.isChangingPassword = true;

    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.passwordMessage = response.message || 'Password changed successfully.';
        alert(this.passwordMessage);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isChangingPassword = false;
      },
      error: (error) => {
        this.showPasswordError(error.error?.detail || 'Could not change password. Please try again.');
        this.isChangingPassword = false;
      }
    });
  }

  private showPasswordError(message: string): void {
    this.passwordError = message;
    alert(message);
  }
}
