import { Component } from '@angular/core';
import { TaskComponent } from '../../components/task/task';

@Component({
  selector: 'app-project-detail',
  imports: [TaskComponent],
  standalone: true,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {

}
