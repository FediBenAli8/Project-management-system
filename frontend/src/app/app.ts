import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskComponent } from './components/task/task';
import { Register } from './views/register/register';
import { Dashboard } from './views/dashboard/dashboard';
import { Report } from './views/report/report';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskComponent, Register, Dashboard, Report],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
