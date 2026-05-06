import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { ProjectService } from '../services/project';
import { catchError, finalize, forkJoin, of } from 'rxjs';

interface LeaderProject {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  leader: number;
}

interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
}

interface ProjectSubtask {
  id: number;
  task_id: number;
  title: string;
  assigned_to: number;
  status: string;
}

interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  created_at?: string;
}

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-management.html',
  styleUrl: './team-management.css',
})
export class TeamManagement implements OnInit {
  allUsers: User[] = [];
  teamLeaders: User[] = [];
  teamMembers: User[] = [];
  currentUser: User | null = null;
  allProjects: LeaderProject[] = [];
  leaderProjects: LeaderProject[] = [];
  displayedProjects: LeaderProject[] = [];
  allTasks: ProjectTask[] = [];
  allSubtasks: ProjectSubtask[] = [];
  projectMembers: ProjectMember[] = [];
  isLoading = true;
  error?: string;
  selectedProjectId: number | null = null;
  selectedMemberId: number | null = null;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.isLoading = true;
    this.error = undefined;

    forkJoin({
      currentUser: this.userService.getCurrentUser().pipe(
        catchError((err) => {
          console.error('Error loading current user:', err);
          this.error = 'Unable to identify the connected user.';
          return of(null);
        })
      ),
      users: this.userService.getAllUsers().pipe(
        catchError((err) => {
          console.error('Error loading users:', err);
          this.error = 'Failed to load team members.';
          return of([]);
        })
      ),
      projects: this.projectService.getProjects().pipe(
        catchError((err) => {
          console.error('Error loading projects:', err);
          return of([]);
        })
      ),
      projectMembers: this.projectService.getProjectMembers().pipe(
        catchError((err) => {
          console.error('Error loading project members:', err);
          return of([]);
        })
      ),
      tasks: this.projectService.getAllTasks().pipe(
        catchError((err) => {
          console.error('Error loading tasks:', err);
          return of([]);
        })
      ),
      subtasks: this.projectService.getAllSubtasks().pipe(
        catchError((err) => {
          console.error('Error loading subtasks:', err);
          return of([]);
        })
      ),
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ currentUser, users, projects, projectMembers, tasks, subtasks }) => {
        this.currentUser = currentUser;
        this.allUsers = users;
        this.allProjects = projects || [];
        this.allTasks = tasks || [];
        this.allSubtasks = subtasks || [];
        this.projectMembers = projectMembers || [];
        this.separateByRole();
        this.refreshProjectViews();
        this.selectedProjectId = this.leaderProjects[0]?.id || null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load team data. Please try again later.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  private separateByRole() {
    const allTeamLeaders = this.allUsers.filter(u => this.isTeamLeaderRole(u.role));

    if (this.isTeamLeader()) {
      this.teamLeaders = allTeamLeaders.filter(leader =>
        Number(leader.id) === Number(this.currentUser?.id)
      );
    } else if (this.isTeamMemberRole(this.currentUser?.role)) {
      const leaderIds = new Set(
        this.getCurrentUserProjectIds().map(projectId => {
          const project = this.allProjects.find(item => Number(item.id) === Number(projectId));
          return Number(project?.leader);
        }).filter(leaderId => !Number.isNaN(leaderId))
      );

      this.teamLeaders = allTeamLeaders.filter(leader => leaderIds.has(Number(leader.id)));
    } else {
      this.teamLeaders = [];
    }

    this.teamMembers = this.allUsers.filter(u => this.isTeamMemberRole(u.role));
  }

  private refreshProjectViews() {
    this.leaderProjects = this.allProjects.filter((project: LeaderProject) =>
      Number(project.leader) === Number(this.currentUser?.id)
    );

    if (this.isTeamLeader()) {
      this.displayedProjects = this.leaderProjects;
      return;
    }

    if (this.isTeamMemberRole(this.currentUser?.role)) {
      const projectIds = new Set(this.getCurrentUserProjectIds());
      this.displayedProjects = this.allProjects.filter(project => projectIds.has(Number(project.id)));
      return;
    }

    this.displayedProjects = [];
  }

  isTeamLeader(): boolean {
    return this.isTeamLeaderRole(this.currentUser?.role);
  }

  private isTeamLeaderRole(role?: string): boolean {
    return ['team_leader', 'leader'].includes(String(role || '').trim().toLowerCase());
  }

  private isTeamMemberRole(role?: string): boolean {
    return ['team_member', 'member'].includes(String(role || '').trim().toLowerCase());
  }

  updateRole(user: User, newRole: string) {
    if (!this.isTeamLeader()) {
      this.error = 'Only team leaders can update roles';
      return;
    }

    if (newRole === user.role) {
      return;
    }

    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        const index = this.allUsers.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.allUsers[index] = updatedUser;
          this.separateByRole();
        }
      },
      error: (err) => {
        this.error = 'Failed to update role';
        console.error(err);
      }
    });
  }

  onRoleChange(user: User, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.updateRole(user, value);
    }
  }

  removeUser(userId: number, username: string) {
    if (!this.isTeamLeader()) {
      this.error = 'Only team leaders can remove users';
      return;
    }

    if (this.currentUser?.id === userId) {
      this.error = 'You cannot remove yourself';
      return;
    }

    if (confirm(`Are you sure you want to remove ${username}?`)) {
      this.userService.removeUser(userId).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter(u => u.id !== userId);
          this.separateByRole();
        },
        error: (err) => {
          this.error = err.error?.detail || 'Failed to remove user';
          console.error(err);
        }
      });
    }
  }

  addMemberToProject() {
    if (!this.isTeamLeader()) {
      this.error = 'Only team leaders can add project members';
      return;
    }

    if (!this.selectedProjectId) {
      this.error = 'Please select a project';
      return;
    }

    if (!this.selectedMemberId) {
      this.error = 'Please select a team member';
      return;
    }

    const projectId = Number(this.selectedProjectId);
    const userId = Number(this.selectedMemberId);

    this.projectService.addProjectMember(projectId, userId).subscribe({
      next: (projectMember) => {
        const existingIndex = this.projectMembers.findIndex(member =>
          Number(member.project_id) === Number(projectMember.project_id) &&
          Number(member.user_id) === Number(projectMember.user_id)
        );

        if (existingIndex === -1) {
          this.projectMembers = [...this.projectMembers, projectMember];
        } else {
          this.projectMembers[existingIndex] = projectMember;
        }

        this.separateByRole();
        this.refreshProjectViews();
        this.selectedMemberId = null;
        this.error = undefined;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Failed to add member to project';
        console.error(err);
      }
    });
  }

  getProjectTasks(projectId: number): ProjectTask[] {
    return this.allTasks.filter(task => Number(task.project_id) === Number(projectId));
  }

  getTaskSubtasks(taskId: number): ProjectSubtask[] {
    return this.allSubtasks.filter(subtask => Number(subtask.task_id) === Number(taskId));
  }

  getMemberName(userId: number): string {
    const user = this.allUsers.find(member => Number(member.id) === Number(userId));
    return user?.username || 'Unassigned';
  }

  getProjectLeaderName(project: LeaderProject): string {
    if (Number(project.leader) === Number(this.currentUser?.id)) {
      return 'You';
    }

    const leader = this.allUsers.find(user => Number(user.id) === Number(project.leader));
    return leader?.username || 'Unknown';
  }

  getProjectMemberUsers(projectId: number): User[] {
    const memberIds = new Set<number>();

    this.projectMembers
      .filter(member => Number(member.project_id) === Number(projectId))
      .forEach(member => memberIds.add(Number(member.user_id)));

    this.getProjectAssignedMemberIds(projectId).forEach(userId => memberIds.add(userId));

    return this.teamMembers.filter(member => memberIds.has(Number(member.id)));
  }

  getAvailableProjectMembers(projectId: number | null): User[] {
    if (!projectId) {
      return [];
    }

    const projectMemberIds = new Set(this.getProjectMemberUsers(Number(projectId)).map(member => Number(member.id)));
    return this.teamMembers.filter(member => !projectMemberIds.has(Number(member.id)));
  }

  private getProjectAssignedMemberIds(projectId: number): number[] {
    const taskIds = new Set(
      this.getProjectTasks(projectId).map(task => Number(task.id))
    );
    const memberIds = new Set<number>();

    this.allSubtasks
      .filter(subtask => taskIds.has(Number(subtask.task_id)))
      .forEach(subtask => memberIds.add(Number(subtask.assigned_to)));

    return Array.from(memberIds);
  }

  private getCurrentUserProjectIds(): number[] {
    const userId = Number(this.currentUser?.id);
    const projectIds = new Set<number>();

    if (!userId) {
      return [];
    }

    this.projectMembers
      .filter(member => Number(member.user_id) === userId)
      .forEach(member => projectIds.add(Number(member.project_id)));

    const assignedTaskIds = new Set(
      this.allSubtasks
        .filter(subtask => Number(subtask.assigned_to) === userId)
        .map(subtask => Number(subtask.task_id))
    );

    this.allTasks
      .filter(task => assignedTaskIds.has(Number(task.id)))
      .forEach(task => projectIds.add(Number(task.project_id)));

    return Array.from(projectIds);
  }

  onSubtaskAssigneeChange(subtask: ProjectSubtask, event: Event) {
    if (!this.isTeamLeader()) {
      this.error = 'Only team leaders can change subtask assignments';
      return;
    }

    const assignedTo = Number((event.target as HTMLSelectElement).value);
    const previousAssignee = subtask.assigned_to;
    subtask.assigned_to = assignedTo;

    this.projectService.updateSubtaskAssignee(subtask.id, assignedTo).subscribe({
      next: (updatedSubtask) => {
        const index = this.allSubtasks.findIndex(item => item.id === subtask.id);
        if (index !== -1) {
          this.allSubtasks[index] = updatedSubtask;
        }
      },
      error: (err) => {
        subtask.assigned_to = previousAssignee;
        this.error = 'Failed to update subtask assignment';
        console.error(err);
      }
    });
  }
}
