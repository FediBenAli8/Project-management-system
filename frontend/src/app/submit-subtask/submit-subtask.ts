import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ProjectService } from '../services/project';

@Component({
  selector: 'app-submit-subtask',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './submit-subtask.html',
  styleUrl: './submit-subtask.css',
})
export class SubmitSubtask implements OnInit {
  subtaskId = 0;
  subtask: any = null;
  task: any = null;
  project: any = null;
  comment = '';
  selectedFile: File | null = null;
  isLoading = true;
  isSubmitting = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subtaskId = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      subtasks: this.projectService.getAllSubtasks().pipe(catchError(() => of([]))),
      tasks: this.projectService.getAllTasks().pipe(catchError(() => of([]))),
      projects: this.projectService.getProjects().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ subtasks, tasks, projects }: any) => {
        this.subtask = (subtasks || []).find((item: any) => Number(item.id) === this.subtaskId);
        this.task = (tasks || []).find((item: any) => Number(item.id) === Number(this.subtask?.task_id));
        this.project = (projects || []).find((item: any) => Number(item.id) === Number(this.task?.project_id));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load subtask details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
    this.error = '';
  }

  submit(): void {
    if (!this.selectedFile) {
      this.error = 'Please choose a file before submitting.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    this.projectService.submitSubtask(this.subtaskId, this.selectedFile, this.comment.trim()).subscribe({
      next: () => {
        this.success = 'Submission sent. Waiting for team leader review.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/my-task']), 900);
      },
      error: (err: any) => {
        this.error = err.error?.detail || 'Could not submit this subtask.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
