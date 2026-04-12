import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Servicetasks } from '../../services/servicetasks';
//import { error } from 'console';

export interface SubTask {
  id: number;
  title: string;
  status: string;
  task_id: number;
  weight_percentage: number;
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
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class TaskComponent implements OnInit {
  constructor(private servicetasks: Servicetasks, private cdr: ChangeDetectorRef) {

  }
  data: Task[] = [];
  getSubTasks() {
    this.servicetasks.getSubTasks().subscribe({
      next: (subtasks) => {
        console.log("subtasks.............." + subtasks);
        subtasks.forEach((st) => {
          //console.log("starts here" + this.data + "this is the console log");
          if (this.data.find((t) => t.id == st.task_id)) {

            this.data.find((t) => t.id == st.task_id)?.subTasks.push(st);
            console.log(st);
          }
        })
      },
    })
  }
  ngOnInit() {
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




  // Track which tasks are expanded
  expandedTaskId: number | null = null;

  toggleExpand(taskId: number): void {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
  }

  toggleSubTask(taskId: number, subTaskId: number): void {
    const task = this.data.find(t => t.id === taskId);
    if (task) {
      const subTask = task.subTasks.find(s => s.id === subTaskId);
      if (subTask) {
        subTask.status = "done";
      }
    }
    const subtasks = this.data.find(t => t.id === taskId)?.subTasks;
    if (subtasks) {
      let st: SubTask;
      let count = 0;
      for (st of subtasks) {
        if (st.status == "done") {
          count++;
        }
      }
      if (task) {
        if (count == subtasks.length) {

          task.status = "done";
        } else {
          task.status = "in-progress";
        }
      }
    }
  }

  isExpanded(taskId: number): boolean {
    return this.expandedTaskId === taskId;
    console.log(this.data)
  }
}