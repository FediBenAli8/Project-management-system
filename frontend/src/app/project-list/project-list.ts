import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../services/project';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit {

  projects: any[] = [];
  filteredProjects: any[] = [];
  searchText = '';
  sortBy = 'title';
  sortOrder = 'asc';
  filterHasDeadline = false;
  isLoading = true;
  allTasks: any[] = [];
  allSubtasks: any[] = [];

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    forkJoin({
      projects: this.projectService.getProjects(),
      tasks: this.projectService.getAllTasks(),
      subtasks: this.projectService.getAllSubtasks(),
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ projects, tasks, subtasks }: any) => {
        this.projects = projects || [];
        this.allTasks = tasks || [];
        this.allSubtasks = subtasks || [];
        this.applyFiltersAndSort();
      },
      error: (err: any) => console.error(err)
    });
  }

  applyFiltersAndSort() {
    let filtered = [...this.projects];

    // Filter by text
    if (this.searchText.trim() !== '') {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Filter by deadline presence
    if (this.filterHasDeadline) {
      filtered = filtered.filter(project => !!project.deadline);
    }

    // Sort
    filtered.sort((a, b) => {
      let valA = a[this.sortBy];
      let valB = b[this.sortBy];

      if (this.sortBy === 'created_at' || this.sortBy === 'deadline') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredProjects = filtered;
    this.cdr.detectChanges();
  }

  searchProjects() {
    this.applyFiltersAndSort();
  }

  viewProjectDetails(projectId: number) {
    this.router.navigate(['/project-detail', projectId]);
  }

  getProjectProgress(projectId: number): number {
    const projectTaskIds = new Set(
      this.allTasks
        .filter(task => Number(task.project_id) === Number(projectId))
        .map(task => Number(task.id))
    );
    const projectSubtasks = this.allSubtasks.filter(subtask =>
      projectTaskIds.has(Number(subtask.task_id))
    );

    if (projectSubtasks.length === 0) {
      return 0;
    }

    const completedSubtasks = projectSubtasks.filter(subtask =>
      this.normalizeStatus(subtask.status) === 'done'
    ).length;

    return Math.round((completedSubtasks / projectSubtasks.length) * 100);
  }

  private normalizeStatus(status: string): string {
    return String(status || '').trim().toLowerCase();
  }
}
