import { Component , OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project';
import { AuthService } from '../services/auth.service';
import { catchError, forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-my-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-task.html',
  styleUrl: './my-task.css',
})


export class MyTask implements OnInit {
  allSubtasks: any[] = [];
  filteredSubtasks: any[] = [];
  allTasks: any[] = [];
  allProjects: any[] = [];
  activeFilter = 'All';
  isLoading = true;

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    forkJoin({
      subtasks: this.projectService.getMySubtasks(userId).pipe(
        catchError((err: any) => {
          console.error('Error fetching subtasks:', err);
          return of([]);
        })
      ),
      tasks: this.projectService.getAllTasks().pipe(
        catchError((err: any) => {
          console.error('Error fetching tasks:', err);
          return of([]);
        })
      ),
      projects: this.projectService.getProjects().pipe(
        catchError((err: any) => {
          console.error('Error fetching projects:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ subtasks, tasks, projects }: any) => {
        this.allSubtasks = subtasks;
        this.allTasks = tasks;
        this.allProjects = projects;
        this.filterTasks(this.activeFilter);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching subtasks:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterTasks(status: string) {
    this.activeFilter = status;
    if (status === 'All') {
      this.filteredSubtasks = this.allSubtasks;
    } else if (status === 'in-progress') {
      this.filteredSubtasks = this.allSubtasks.filter(subtask =>
        ['todo', 'in-progress', 'in_progress', 'in progress'].includes(this.normalizeStatus(subtask.status))
      );
    } else if (status === 'pending_review') {
      this.filteredSubtasks = this.allSubtasks.filter(
        subtask => this.normalizeStatus(subtask.status) === 'pending_review'
      );
    } else {
      this.filteredSubtasks = this.allSubtasks.filter(
        subtask => this.normalizeStatus(subtask.status) === this.normalizeStatus(status)
      );
    }
  }
  
  goToSubmission(subtaskId: number) {
    this.router.navigate(['/submit-subtask', subtaskId]);
  }

  getBadgeClass(status: string): string {
    switch (this.normalizeStatus(status)) {
      case 'todo': return 'todo';
      case 'in-progress':
      case 'in_progress':
      case 'in progress':
        return 'progress';
      case 'done': return 'done';
      case 'pending_review': return 'review';
      case 'rejected': return 'rejected';
      default: return 'progress';
    }
  }

  isCompletedOrSubmitted(status: string): boolean {
    return ['done', 'pending_review'].includes(this.normalizeStatus(status));
  }

  private normalizeStatus(status: string): string {
    return String(status || '').trim().toLowerCase();
  }

  getTaskName(subtask: any): string {
    const task = this.allTasks.find(item => Number(item.id) === Number(subtask.task_id));
    return task?.title || 'Unknown task';
  }

  getProjectName(subtask: any): string {
    const task = this.allTasks.find(item => Number(item.id) === Number(subtask.task_id));
    const project = this.allProjects.find(item => Number(item.id) === Number(task?.project_id));
    return project?.title || 'Unknown project';
  }

  
  }
