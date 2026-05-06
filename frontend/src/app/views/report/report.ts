import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DeadlineTrackingCard } from '../../components/deadline-tracking-card/deadline-tracking-card';
import { ChatComp } from '../../components/chat-comp/chat-comp';
import { PerfComp } from '../../components/perf-comp/perf-comp';
import { ProjectService } from '../../services/project';
import { finalize, forkJoin } from 'rxjs';


export interface ProjectReport {
  projectName: string;
  progress: number;
  health: string;
  mileStone: string;
}

export interface TeamPerformance {
  taskCompleted: number;
  taskPending: number;
  taskInProgress: number;
  workload: number;
  velocity: number;
}

export interface DeadlineTracking {
  projectId: number;
  type: string;
  deadline: string;
  daysLeft: number;
  userName: string;
  project: string;
  progress: number;
  statusLabel: string;
  statusColor: string;
}

interface ProjectDeadlineSource {
  id: number;
  title?: string;
  deadline?: string;
}

interface ProjectWithDeadline extends ProjectDeadlineSource {
  deadline: string;
}

@Component({
  selector: 'app-report',
  imports: [PerfComp, DeadlineTrackingCard, ChatComp],
  standalone: true,
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report implements OnInit {

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
  ) { }


  projectReports: ProjectReport[] = [
    {
      projectName: 'Project 1',
      progress: 50,
      health: 'Good',
      mileStone: 'Milestone 1',
    },
    {
      projectName: 'Project 2',
      progress: 75,
      health: 'Good',
      mileStone: 'Milestone 2',
    },
    {
      projectName: 'Project 3',
      progress: 25,
      health: 'Bad',
      mileStone: 'Milestone 3',
    },
  ];

  teamPerformance: TeamPerformance = {
    taskCompleted: 10,
    taskPending: 5,
    taskInProgress: 3,
    workload: 18,
    velocity: 13,
  };

  deadlineTracking: DeadlineTracking[] = [];
  isDeadlineLoading = true;
  allTasks: any[] = [];
  allSubtasks: any[] = [];

  ngOnInit(): void {
    this.loadProjectDeadlines();
  }

  private loadProjectDeadlines(): void {
    this.isDeadlineLoading = true;

    forkJoin({
      projects: this.projectService.getProjects(),
      tasks: this.projectService.getAllTasks(),
      subtasks: this.projectService.getAllSubtasks(),
    }).pipe(
      finalize(() => {
        this.isDeadlineLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ projects, tasks, subtasks }: any) => {
        this.allTasks = tasks || [];
        this.allSubtasks = subtasks || [];

        this.deadlineTracking = ((projects || []) as ProjectDeadlineSource[])
          .filter((project): project is ProjectWithDeadline =>
            !!project.deadline && !Number.isNaN(new Date(project.deadline).getTime())
          )
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .slice(0, 6)
          .map(project => {
            const progress = this.getProjectProgress(project.id);
            const daysLeft = this.getDaysLeft(project.deadline);

            return {
              projectId: project.id,
              type: 'Project',
              deadline: this.formatDate(project.deadline),
              daysLeft,
              userName: this.getDeadlineStatus(project.deadline),
              project: project.title || 'Untitled project',
              progress,
              statusLabel: this.getProgressStatus(progress, daysLeft),
              statusColor: this.getProgressColor(progress, daysLeft),
            };
          });
      },
      error: (err) => {
        console.error('Failed to load project deadlines', err);
        this.deadlineTracking = [];
      }
    });
  }

  private getProjectProgress(projectId: number): number {
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

  private getDaysLeft(deadline: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const oneDay = 1000 * 60 * 60 * 24;
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / oneDay);
  }

  private formatDate(deadline: string): string {
    return new Date(deadline).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private getDeadlineStatus(deadline: string): string {
    const daysLeft = this.getDaysLeft(deadline);

    if (daysLeft < 0) {
      return 'Overdue';
    }

    if (daysLeft === 0) {
      return 'Due today';
    }

    return 'Upcoming';
  }

  private getProgressStatus(progress: number, daysLeft: number): string {
    if (progress >= 100) {
      return 'Completed';
    }

    if (daysLeft > 30) {
      return 'In progress';
    }

    if (daysLeft < 30 && progress < 50) {
      return 'At risk';
    }

    if (progress >= 60) {
      return 'On track';
    }

    if (progress >= 30) {
      return 'In progress';
    }

    return 'At risk';
  }

  private getProgressColor(progress: number, daysLeft: number): string {
    if (progress >= 100) {
      return '#10b981';
    }

    if (daysLeft > 30) {
      return '#f59e0b';
    }

    if (daysLeft < 30 && progress < 50) {
      return '#ef4444';
    }

    if (progress >= 60) {
      return '#3b82f6';
    }

    if (progress >= 30) {
      return '#f59e0b';
    }

    return '#ef4444';
  }
  teamPerfomance: TeamPerformance[] = [
    {
      taskCompleted: 10,
      taskPending: 5,
      taskInProgress: 3,
      workload: 18,
      velocity: 13,
    },
    {
      taskCompleted: 10,
      taskPending: 5,
      taskInProgress: 3,
      workload: 18,
      velocity: 13,
    },
    {
      taskCompleted: 10,
      taskPending: 5,
      taskInProgress: 3,
      workload: 18,
      velocity: 13,
    },
  ]
}
