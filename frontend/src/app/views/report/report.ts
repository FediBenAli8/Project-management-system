import { Component } from '@angular/core';
import { ProjectReportCard } from '../../components/project-report-card/project-report-card';
import { TeamPerformanceCard } from '../../components/team-performance-card/team-performance-card';
import { DeadlineTrackingCard } from '../../components/deadline-tracking-card/deadline-tracking-card';

export interface ProjectReport {
  projectName: string;
  progress: number;
  health: string;
  mileStone: string;
}

export interface TeamPerformance {
  taskCompleted: number;
  taskPending: number;
  taskInProgress: number;
  workload: number;
  velocity: number;
}

export interface DeadlineTracking {
  type: string;
  deadline: string;
  daysLeft: number;
  userName: string;
  project: string;
}

@Component({
  selector: 'app-report',
  imports: [ProjectReportCard, TeamPerformanceCard, DeadlineTrackingCard],
  standalone: true,
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report {
  projectReports: ProjectReport[] = [
    {
      projectName: 'Project 1',
      progress: 50,
      health: 'Good',
      mileStone: 'Milestone 1',
    },
    {
      projectName: 'Project 2',
      progress: 75,
      health: 'Good',
      mileStone: 'Milestone 2',
    },
    {
      projectName: 'Project 3',
      progress: 25,
      health: 'Bad',
      mileStone: 'Milestone 3',
    },
  ];

  teamPerformance: TeamPerformance = {
    taskCompleted: 10,
    taskPending: 5,
    taskInProgress: 3,
    workload: 18,
    velocity: 13,
  };

  deadlineTracking: DeadlineTracking[] = [
    {
      type: 'Task',
      deadline: '2022-12-31',
      daysLeft: 30,
      userName: 'User 1',
      project: 'Project 1',
    },
    {
      type: 'Task',
      deadline: '2022-12-31',
      daysLeft: 30,
      userName: 'User 2',
      project: 'Project 2',
    },
    {
      type: 'Task',
      deadline: '2022-12-31',
      daysLeft: 30,
      userName: 'User 3',
      project: 'Project 3',
    },
  ];
  teamPerfomance: TeamPerformance[] = [
    {
      taskCompleted: 10,
      taskPending: 5,
      taskInProgress: 3,
      workload: 18,
      velocity: 13,
    },
    {
      taskCompleted: 10,
      taskPending: 5,
      taskInProgress: 3,
      workload: 18,
      velocity: 13,
    },
    {
      taskCompleted: 10,
      taskPending: 5,
      taskInProgress: 3,
      workload: 18,
      velocity: 13,
    },
  ]
}
