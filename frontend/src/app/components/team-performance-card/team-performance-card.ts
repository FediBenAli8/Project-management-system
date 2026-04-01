import { Component, Input } from '@angular/core';
import { TeamPerformance } from '../../views/report/report';

@Component({
  selector: 'app-team-performance-card',
  imports: [],
  templateUrl: './team-performance-card.html',
  styleUrl: './team-performance-card.css',
})
export class TeamPerformanceCard {
  @Input() performance!: TeamPerformance;
}
