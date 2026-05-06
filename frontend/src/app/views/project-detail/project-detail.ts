import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskComponent } from '../../components/task/task';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project';

@Component({
  selector: 'app-project-detail',
  imports: [TaskComponent, CommonModule],
  standalone: true,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  projectId: number = 0;
  project: any = null;
  isLoading = true;
  projectProgress: number = 0;
  leaderName: string = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = Number(params['id']);
      console.log('Project ID from route:', this.projectId);
      this.loadProjectData();
    });
  }

  loadProjectData() {
    this.projectService.getProjects().subscribe({
      next: (projects: any[]) => {
        console.log('All projects:', projects);
        this.project = projects.find(p => p.id === this.projectId);
        console.log('Found project:', this.project);
        
        if (this.project) {
          // Fetch leader name
          console.log('Fetching leader with ID:', this.project.leader);
          this.projectService.getUser(this.project.leader).subscribe({
            next: (user: any) => {
              console.log('User data received:', user);
              this.leaderName = user.username || 'Unknown';
              console.log('Leader name set to:', this.leaderName);
              this.cdr.detectChanges();
            },
            error: (err: any) => {
              console.error('Error loading leader:', err);
              this.leaderName = 'Unknown';
            }
          });

          // Fetch tasks and calculate progress
          this.projectService.getTasksByProject(this.projectId).subscribe({
            next: (tasks: any[]) => {
              console.log('Tasks for project:', tasks);
              this.project.tasks = tasks;
              
              // Initialize subtasks array for each task
              this.project.tasks.forEach((task: any) => {
                task.subTasks = [];
              });

              // Fetch all subtasks
              this.projectService.getAllSubtasks().subscribe({
                next: (subtasks: any[]) => {
                  console.log('All subtasks:', subtasks);
                  
                  // Map subtasks to their tasks
                  subtasks.forEach((subtask: any) => {
                    const task = this.project.tasks.find((t: any) => t.id === subtask.task_id);
                    if (task) {
                      task.subTasks.push(subtask);
                    }
                  });

                  // Calculate progress
                  this.calculateProjectProgress();
                  this.isLoading = false;
                  this.cdr.detectChanges();
                },
                error: (err: any) => {
                  console.error('Error loading subtasks:', err);
                  this.calculateProjectProgress();
                  this.isLoading = false;
                  this.cdr.detectChanges();
                }
              });
            },
            error: (err: any) => {
              console.error('Error loading tasks:', err);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error loading project:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateProjectProgress() {
    if (!this.project || !this.project.tasks || this.project.tasks.length === 0) {
      this.projectProgress = 0;
      return;
    }

    let totalSubtasks = 0;
    let completedSubtasks = 0;

    this.project.tasks.forEach((task: any) => {
      if (task.subTasks && task.subTasks.length > 0) {
        task.subTasks.forEach((subtask: any) => {
          totalSubtasks++;
          if (subtask.status === 'done') {
            completedSubtasks++;
          }
        });
      }
    });

    if (totalSubtasks === 0) {
      this.projectProgress = 0;
    } else {
      this.projectProgress = Math.round((completedSubtasks / totalSubtasks) * 100);
    }
    
    console.log('Project progress calculated:', this.projectProgress, `(${completedSubtasks}/${totalSubtasks})`);
  }
}
