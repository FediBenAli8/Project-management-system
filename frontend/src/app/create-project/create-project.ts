import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/project';
import { Router } from '@angular/router';
import { User, UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

interface ProjectSubtask {
  title: string;
  assignedTo: number | null;
}

interface ProjectTask {
  title: string;
  subtasks: ProjectSubtask[];
  newSubtask: string;
  newSubtaskAssignee: number | null;
  showForm: boolean;
}

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})
export class CreateProject implements OnInit {

  projectTitle = '';
  projectDescription = '';
  projectDeadline = '';
  minDate = '';
  taskTitle = '';
  teamMembers: User[] = [];
  tasks: ProjectTask[] = [];

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) { 
    this.minDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.teamMembers = users.filter(user => this.isTeamMemberRole(user.role));
      },
      error: (err) => {
        console.error('Error loading team members:', err);
      }
    });
  }

  addTask() {
    if (this.projectTitle.trim() === '') {
      alert('Please enter a project title before adding tasks!');
      return;
    }
    if (this.taskTitle.trim() === '') {
      alert('Please enter a task title!');
      return;
    }
    this.tasks.push({
      title: this.taskTitle,
      subtasks: [],
      newSubtask: '',
      newSubtaskAssignee: null,
      showForm: false
    });
    this.taskTitle = '';
  }

  removeTask(i: number) {
    this.tasks.splice(i, 1);
  }

  saveProject() {
    if (this.projectTitle.trim() === '') {
      alert('Please enter a project title!');
      return;
    }

    if (this.projectDeadline) {
      const selectedDate = new Date(this.projectDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert('The deadline cannot be in the past!');
        return;
      }
    }

    const unassignedSubtask = this.tasks.some(task =>
      task.subtasks.some(subtask => !subtask.assignedTo)
    );

    if (unassignedSubtask) {
      alert('Please assign every subtask to a team member!');
      return;
    }

    const project = {
      title: this.projectTitle,
      description: this.projectDescription,
      deadline: this.projectDeadline || null,
      leader: this.auth.user()?.id || 1
    };
    console.log(project);
    this.projectService.createProject(project).subscribe({
      next: (createdProject: any) => {
        console.log('Project created:', createdProject);

        if (this.tasks.length === 0) {
          alert('Project created successfully! ✅');
          this.router.navigate(['/project-list']);
          return;
        }

        let tasksCompleted = 0;

        this.tasks.forEach(task => {
          this.projectService.createTask({
            title: task.title,
            project_id: createdProject.id,
            created_by: this.auth.user()?.id || 1
          }).subscribe({
            next: (createdTask: any) => {
              console.log('Task created:', createdTask);

              if (task.subtasks.length === 0) {
                tasksCompleted++;
                if (tasksCompleted === this.tasks.length) {
                  alert('Project and tasks created! ✅');
                  this.router.navigate(['/project-list']);
                }
                return;
              }

              let subtasksCompleted = 0;
              task.subtasks.forEach(subtask => {
                this.projectService.createSubtask({
                  title: subtask.title,
                  task_id: createdTask.id,
                  status: 'todo',
                  weight_percentage: 0,
                  assigned_to: subtask.assignedTo
                }).subscribe({
                  next: (createdSubtask: any) => {
                    console.log('Subtask created:', createdSubtask);
                    subtasksCompleted++;
                    if (subtasksCompleted === task.subtasks.length) {
                      tasksCompleted++;
                      if (tasksCompleted === this.tasks.length) {
                        alert('Project, tasks and subtasks created! ✅');
                        this.router.navigate(['/project-list']);
                      }
                    }
                  },
                  error: (err: any) => console.error('Subtask error:', err)
                });
              });
            },
            error: (err: any) => console.error('Task error:', err)
          });
        });
      },
      error: (err: any) => {
        console.error('Project error:', err);
        alert(err.error?.detail || 'Failed to create project');
      }
    });
  }

  cancelProject() {
    this.router.navigate(['/project-list']);
  }

  toggleSubtaskForm(index: number) {
    this.tasks[index].showForm = !this.tasks[index].showForm;
  }

  addSubtask(index: number) {
    const task = this.tasks[index];
    if (task.newSubtask.trim() === '') {
      alert('Please enter a subtask title!');
      return;
    }
    if (!task.newSubtaskAssignee) {
      alert('Please assign this subtask to a team member!');
      return;
    }
    task.subtasks.push({
      title: task.newSubtask,
      assignedTo: task.newSubtaskAssignee
    });
    task.newSubtask = '';
    task.newSubtaskAssignee = null;
  }

  removeSubtask(taskIndex: number, subtaskIndex: number) {
    this.tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
  }

  private isTeamMemberRole(role: string) {
    return ['team_member', 'member'].includes(String(role || '').trim().toLowerCase());
  }
}
