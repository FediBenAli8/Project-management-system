import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from './components/side-bar/side-bar';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: AuthService) {}
}
