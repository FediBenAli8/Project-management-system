import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '../components/task/task';
import { SubTask } from '../components/task/task';

@Injectable({
  providedIn: 'root',
})
export class Servicetasks {
  private apiUrl = "http://localhost:8000/tasks";
  private baseUrl = "http://localhost:8000";
  constructor(private http: HttpClient) {

  }
  getTasks() {
    return this.http.get<Task[]>(this.apiUrl);
  }
  getTasksByProject(projectId: number) {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }
  getSubTasks() {
    return this.http.get<SubTask[]>(this.apiUrl + "/subtasks");
  }
  updateSubtaskStatus(subtaskId: number, status: string) {
    return this.http.put(`${this.baseUrl}/subtasks/${subtaskId}/status`, { status });
  }
}
