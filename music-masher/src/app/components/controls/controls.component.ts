import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Timeline } from '../../models';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, OnDestroy {
  timeline?: Timeline;
  private subscription?: Subscription;

  constructor(private timelineService: TimelineService) {}

  ngOnInit(): void {
    this.subscription = this.timelineService.getTimeline().subscribe(timeline => {
      this.timeline = timeline;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Play/pause toggle
   */
  togglePlayPause(): void {
    if (!this.timeline) return;

    if (this.timeline.isPlaying) {
      this.timelineService.pause();
    } else {
      this.timelineService.play();
    }
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.timelineService.stop();
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    if (!this.timeline) return;
    this.timelineService.setZoom(this.timeline.zoom * 1.2);
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    if (!this.timeline) return;
    this.timelineService.setZoom(this.timeline.zoom / 1.2);
  }

  /**
   * Reset zoom
   */
  resetZoom(): void {
    this.timelineService.setZoom(50);
  }

  /**
   * Clear all tracks
   */
  clearAll(): void {
    if (confirm('Are you sure you want to remove all tracks?')) {
      this.timelineService.clearAll();
    }
  }

  /**
   * Format time for display
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  /**
   * Get playback progress percentage
   */
  getProgress(): number {
    if (!this.timeline || this.timeline.duration === 0) {
      return 0;
    }
    return (this.timeline.currentTime / this.timeline.duration) * 100;
  }
}
