import { Component, Input } from '@angular/core';
import { ProjectReport } from '../../views/report/report';

@Component({
  selector: 'app-project-report-card',
  imports: [],
  templateUrl: './project-report-card.html',
  styleUrl: './project-report-card.css',
})
export class ProjectReportCard {
  @Input() report!: ProjectReport;
}
