import { Component } from '@angular/core';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ControlsComponent } from './components/controls/controls.component';

@Component({
  selector: 'app-root',
  imports: [TimelineComponent, ControlsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Music Masher';
}
