import { Component, Input, Output, EventEmitter } from '@angular/core';

interface TaskByAi {
  name: string,
  weight: number,
  subtasks: SubTaskByAi[]
}
interface SubTaskByAi {
  name: string,
  weight: number
}

@Component({
  selector: 'app-suggested-structure',
  imports: [],
  templateUrl: './suggested-structure.html',
  styleUrl: './suggested-structure.css',
})
export class SuggestedStructure {
  @Input() isVisible = false;
  @Input() structure: { tasks: TaskByAi[] } | null = null;
  @Output() accepted = new EventEmitter<{ tasks: any[] }>();
  @Output() dismissed = new EventEmitter<void>();

  onAccept() { this.accepted.emit(this.structure!); this.isVisible = false; }
  onDismiss() { this.dismissed.emit(); this.isVisible = false; }
}
