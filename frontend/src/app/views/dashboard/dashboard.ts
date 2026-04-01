import { Component } from '@angular/core';
import { TaskComponent } from '../../components/task/task';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(private router: Router) { }
  goToProjectDetail() {
    this.router.navigate(['/project-detail']);
  }
}

