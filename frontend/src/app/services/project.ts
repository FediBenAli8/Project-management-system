import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
   private apiUrl = 'http://localhost:8000';
   private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  createProject(project: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/`, project, this.httpOptions);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/`, task, this.httpOptions);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/`);
  }
  getProjectMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/members/`);
  }
  addProjectMember(projectId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/members`, { user_id: userId }, this.httpOptions);
  }
  getSubtasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subtasks`);
  }
  createSubtask(subtask: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/subtasks`, subtask, this.httpOptions);
  }
  getMySubtasks(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subtasks/user/${userId}`);
  }

  updateSubtaskStatus(subtaskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/subtasks/${subtaskId}/status`, { status });
  }

  submitSubtask(subtaskId: number, file: File, comment: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);

    return this.http.post(`${this.apiUrl}/subtasks/${subtaskId}/submit`, formData);
  }

  getLeaderReviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subtasks/leader/reviews`);
  }

  approveSubmission(submissionId: number, comment?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/subtasks/submissions/${submissionId}/approve`, { comment });
  }

  rejectSubmission(submissionId: number, comment: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/subtasks/submissions/${submissionId}/reject`, { comment });
  }

  downloadSubmission(submissionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/subtasks/submissions/${submissionId}/download`, {
      responseType: 'blob'
    });
  }

  updateSubtaskAssignee(subtaskId: number, assignedTo: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/subtasks/${subtaskId}/assignee`, { assigned_to: assignedTo });
  }

  getUser(userId: number): Observable<any> {
    console.log(`Calling API: GET /users/${userId}`);
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  getTasksByProject(projectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/project/${projectId}`);
  }

  getAllSubtasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/subtasks`);
  }

  getAllTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/`);
  }
}
