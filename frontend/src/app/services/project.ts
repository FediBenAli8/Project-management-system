import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
   private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createProject(project: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/`, project);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/`, task);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/`);
  }
  getSubtasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/subtasks`);
  }
}
