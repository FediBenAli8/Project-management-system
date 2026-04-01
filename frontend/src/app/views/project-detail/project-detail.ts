import { Component } from '@angular/core';
import { SideBar } from '../../components/side-bar/side-bar';
import { TaskComponent } from '../../components/task/task';

@Component({
  selector: 'app-project-detail',
  imports: [SideBar, TaskComponent],
  standalone: true,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {

}
