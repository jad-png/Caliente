import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerControlsComponent } from './shared/components/player-controls/player-controls.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PlayerControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MusicStream';
}
