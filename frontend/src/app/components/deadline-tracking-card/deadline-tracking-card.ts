import { Component, Input } from '@angular/core';
import { DeadlineTracking } from '../../views/report/report';

@Component({
  selector: 'app-deadline-tracking-card',
  imports: [],
  templateUrl: './deadline-tracking-card.html',
  styleUrl: './deadline-tracking-card.css',
})
export class DeadlineTrackingCard {
  @Input() deadline!: DeadlineTracking;
}
