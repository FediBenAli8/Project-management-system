import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Servicetasks } from '../../services/servicetasks';
import { CommonModule } from '@angular/common';


export interface SubTask {
  id: number;
  title: string;
  status: string;
  task_id: number;
  weight_percentage: number;
  assigned_to: number;
  member_name?: string;
  assigned_to_name?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  project_id: number;
  created_by: number;
  subTasks: SubTask[];
}

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class TaskComponent implements OnInit {
  @Input() projectId: number = 0;

  constructor(private servicetasks: Servicetasks, private cdr: ChangeDetectorRef) {

  }
  data: Task[] = [];
  getSubTasks() {
    this.servicetasks.getSubTasks().subscribe({
      next: (subtasks) => {
        console.log("subtasks.............." + subtasks);
        subtasks.forEach((st) => {

          if (this.data.find((t) => t.id == st.task_id)) {

            this.data.find((t) => t.id == st.task_id)?.subTasks.push(st);
            console.log(st);
          }
        })
      },
    })
  }
  ngOnInit() {
    if (this.projectId) {
      // Load tasks for specific project
      this.servicetasks.getTasksByProject(this.projectId).subscribe({
        next: async (data) => { this.data = data; this.cdr.markForCheck(); },
        error: (err) => { console.log(err) },
        complete: async () => {
          this.data.forEach((t) => {
            console.log(t);
            t.subTasks = [];
          })
          this.getSubTasks()
        }
      });
    } else {
      // Load all tasks if no project ID
      this.servicetasks.getTasks().subscribe({
        next: async (data) => { this.data = data; this.cdr.markForCheck(); },
        error: (err) => { console.log(err) },
        complete: async () => {
          this.data.forEach((t) => {
            console.log(t);
            t.subTasks = [];
          })
          this.getSubTasks()
        }
      });
    }
  }





  expandedTaskId: number | null = null;

  toggleExpand(taskId: number): void {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
  }

  toggleSubTask(taskId: number, subTaskId: number): void {
    const task = this.data.find(t => t.id === taskId);
    if (!task) return;
    const subTask = task.subTasks.find(s => s.id === subTaskId);
    if (!subTask) return;

    const prevStatus = subTask.status;
    const newStatus = prevStatus === 'done' ? 'in-progress' : 'done';

    // Optimistically update local state
    subTask.status = newStatus;

    // Recalculate parent task status
    const subtasks = task.subTasks;
    const doneCount = subtasks.filter(st => st.status === 'done').length;
    task.status = doneCount === subtasks.length ? 'done' : 'in-progress';

    // Persist change to backend; revert on failure
    this.servicetasks.updateSubtaskStatus(subTaskId, newStatus).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update subtask status', err);
        // revert local state
        subTask.status = prevStatus;
        const doneCount2 = subtasks.filter(st => st.status === 'done').length;
        task.status = doneCount2 === subtasks.length ? 'done' : 'in-progress';
        this.cdr.markForCheck();
      }
    });
  }

  isExpanded(taskId: number): boolean {
    return this.expandedTaskId === taskId;
    console.log(this.data)
  }
}
