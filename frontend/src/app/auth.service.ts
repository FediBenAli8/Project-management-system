import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  userName = signal('');

  login(email: string) {
    this.userName.set(email);
    this.isLoggedIn.set(true);
  }

  register(name: string) {
    this.userName.set(name);
    this.isLoggedIn.set(true);
  }

  logout() {
    this.userName.set('');
    this.isLoggedIn.set(false);
  }
}
