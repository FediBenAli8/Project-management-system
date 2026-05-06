import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface Subtask {
    id: number;
    name: string;
    status: string;
}


@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = 'http://localhost:8000/reports';

    constructor(private http: HttpClient) { }

    getSubtasks() {
        return this.http.get(`${this.apiUrl}/subtasks`);
    }
    getTeamPerformance() {
        return this.http.get(`${this.apiUrl}/teamPerf`);
    }
}