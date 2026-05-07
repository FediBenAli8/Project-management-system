import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SideBar } from './components/side-bar/side-bar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBar, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: AuthService) { }

  ngOnInit() {
    // Attempt to restore session on page refresh
    if (!this.auth.isLoggedIn()) {
      this.auth.refresh().subscribe({
        error: () => console.log('No active session found')
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
