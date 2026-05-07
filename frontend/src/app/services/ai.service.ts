import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubTask { name: string; description: string; weight: number; }
export interface Task { name: string; description: string; weight: number; subtasks: SubTask[]; }
export interface AIStructure { tasks: Task[]; }

@Injectable({ providedIn: 'root' })
export class AiService {
    private apiUrl = 'http://localhost:8000/projects';

    constructor(private http: HttpClient) { }

    generateStructure(title: string, description: string): Observable<{ success: boolean; structure: AIStructure }> {
        return this.http.post<any>(`${this.apiUrl}/generate-structure`, { title, description });
    }
}