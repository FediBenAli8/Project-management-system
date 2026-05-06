import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';

interface DashboardStat {
  label: string;
  value: string | number;
  iconClass: string;
  iconColorClass: string;
}

interface DashboardProject {
  id: number;
  title: string;
  dueText: string;
  taskCount: number;
  subtaskCount: number;
  progress: number;
}

interface DashboardTask {
  title: string;
  projectName: string;
  priority: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStat[] = [];
  recentProjects: DashboardProject[] = [];
  priorityTasks: DashboardTask[] = [];
  isLoading = true;
  error?: string;

  constructor(
    public auth: AuthService,
    private router: Router,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;
    this.error = undefined;

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
        this.buildDashboard(projects || [], tasks || [], subtasks || []);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Unable to load dashboard data. Please try again later.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  private buildDashboard(projects: any[], tasks: any[], subtasks: any[]) {
    const currentUserId = this.auth.user()?.id;
    const mySubtasks = currentUserId
      ? subtasks.filter((item) => Number(item.assigned_to) === Number(currentUserId))
      : [];
    const myTaskIds = new Set(mySubtasks.map((item) => item.task_id));
    const myTasks = tasks.filter((task) => myTaskIds.has(task.id));
    const myProjectIds = new Set(myTasks.map((task) => task.project_id));
    const myProjects = projects.filter((project) =>
      myProjectIds.has(project.id) || Number(project.leader) === Number(currentUserId)
    );

    const progressSubtasks = this.auth.isTeamLeader()
      ? this.getSubtasksForProjects(myProjects, tasks, subtasks)
      : mySubtasks;
    const completedProgressSubtasks = progressSubtasks.filter(
      (item) => this.normalizeStatus(item.status) === 'done'
    ).length;
    const myProgress = progressSubtasks.length > 0
      ? Math.round((completedProgressSubtasks / progressSubtasks.length) * 100)
      : 0;
    const completedTasks = mySubtasks.filter((item) => this.normalizeStatus(item.status) === 'done').length;
    const overdueCount = mySubtasks.filter((subtask) => {
      if (this.normalizeStatus(subtask.status) === 'done') {
        return false;
      }

      const task = tasks.find((item) => item.id === subtask.task_id);
      if (!task) {
        return false;
      }

      const project = projects.find((item) => item.id === task.project_id);
      if (!project || !project.deadline) {
        return false;
      }

      return new Date(project.deadline) < new Date();
    }).length;

    this.stats = [
      {
        label: 'My Projects',
        value: myProjects.length,
        iconClass: 'fa-folder',
        iconColorClass: 'icon-blue',
      },
      {
        label: 'My Tasks',
        value: mySubtasks.length,
        iconClass: 'fa-list-check',
        iconColorClass: 'icon-green',
      },
      {
        label: 'Completed',
        value: completedTasks,
        iconClass: 'fa-circle-check',
        iconColorClass: 'icon-orange',
      },
      {
        label: 'Tasks Overdue',
        value: overdueCount,
        iconClass: 'fa-clock',
        iconColorClass: 'icon-orange',
      },
      {
        label: 'My Progress',
        value: `${myProgress}%`,
        iconClass: 'fa-chart-line',
        iconColorClass: 'icon-purple',
      },
    ];

    const taskMap = tasks.reduce((map: Record<number, any>, task) => {
      map[task.id] = task;
      return map;
    }, {} as Record<number, any>);

    const projectsById = projects.reduce((map: Record<number, any>, project) => {
      map[project.id] = project;
      return map;
    }, {} as Record<number, any>);

    const projectReports = myProjects.map((project) => {
      const projectTasks = tasks.filter((task) => task.project_id === project.id);
      const projectTaskIds = new Set(projectTasks.map((task) => task.id));
      const projectSubtasks = subtasks.filter((subtask) => projectTaskIds.has(subtask.task_id));
      const projectCompletedSubtasks = projectSubtasks.filter(
        (item) => this.normalizeStatus(item.status) === 'done'
      ).length;

      return {
        id: project.id,
        title: project.title,
        dueText: project.deadline ? this.formatDate(project.deadline) : 'No deadline',
        taskCount: projectTasks.length,
        subtaskCount: projectSubtasks.length,
        progress: projectSubtasks.length > 0
          ? Math.round((projectCompletedSubtasks / projectSubtasks.length) * 100)
          : 0,
      } as DashboardProject;
    });

    this.recentProjects = projectReports
      .sort((a, b) => {
        const dateA = new Date(projectsById[a.id]?.created_at || 0).getTime();
        const dateB = new Date(projectsById[b.id]?.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);

    this.priorityTasks = mySubtasks
      .filter((subtask) => this.normalizeStatus(subtask.status) !== 'done')
      .sort((a, b) => Number(b.weight_percentage || 0) - Number(a.weight_percentage || 0))
      .slice(0, 4)
      .map((subtask) => {
        const task = taskMap[subtask.task_id];
        const project = task ? projectsById[task.project_id] : undefined;
        return {
          title: subtask.title,
          projectName: project?.title ?? 'Unknown Project',
          priority: this.mapPriority(Number(subtask.weight_percentage || 0)),
          status: subtask.status,
        } as DashboardTask;
      });
  }

  private normalizeStatus(value: string | null | undefined) {
    return String(value || '').trim().toLowerCase();
  }

  private getSubtasksForProjects(projects: any[], tasks: any[], subtasks: any[]) {
    const projectIds = new Set(projects.map(project => Number(project.id)));
    const taskIds = new Set(
      tasks
        .filter(task => projectIds.has(Number(task.project_id)))
        .map(task => Number(task.id))
    );

    return subtasks.filter(subtask => taskIds.has(Number(subtask.task_id)));
  }

  private mapPriority(weight: number) {
    if (weight >= 75) {
      return 'High';
    }
    if (weight >= 40) {
      return 'Medium';
    }
    return 'Low';
  }

  private formatDate(value: string | null | undefined) {
    if (!value) {
      return 'No deadline';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  goToProjectDetail() {
    this.router.navigate(['/project-detail']);
  }
}
