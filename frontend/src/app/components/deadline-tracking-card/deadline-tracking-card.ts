import { Component, Input } from '@angular/core';
import { DeadlineTracking } from '../../views/report/report';

@Component({
  selector: 'app-deadline-tracking-card',
  imports: [],
  standalone: true,
  templateUrl: './deadline-tracking-card.html',
  styleUrl: './deadline-tracking-card.css',
})
export class DeadlineTrackingCard {
  @Input() deadline!: DeadlineTracking;

  get dayCount(): number {
    return Math.abs(this.deadline.daysLeft);
  }

  get dayLabel(): string {
    if (this.deadline.daysLeft < 0) {
      return 'Days Overdue';
    }

    if (this.deadline.daysLeft === 0) {
      return 'Due Today';
    }

    return 'Days Left';
  }
}
