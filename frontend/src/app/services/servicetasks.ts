import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '../components/task/task';
import { SubTask } from '../components/task/task';

@Injectable({
  providedIn: 'root',
})
export class Servicetasks {
  private apiUrl = "http://localhost:8000/tasks/project";
  constructor(private http: HttpClient) {

  }
  getTasks() {
    return this.http.get<Task[]>(this.apiUrl);
  }
  getSubTasks() {
    return this.http.get<SubTask[]>(this.apiUrl + "/subtasks");
  }
}
