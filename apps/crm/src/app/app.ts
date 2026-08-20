import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './shared/loading-overlay.component';

@Component({
  selector: 'pulso-crm-root',
  imports: [RouterOutlet, LoadingOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly loading = signal(true);
}
