import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Timeline, AudioTrack } from '../../models';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
  @ViewChild('timelineCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  timeline?: Timeline;
  private subscription?: Subscription;
  private isDragging = false;
  private draggedTrack?: AudioTrack;
  private dragOffsetX = 0;

  constructor(private timelineService: TimelineService) {}

  ngOnInit(): void {
    this.subscription = this.timelineService.getTimeline().subscribe(timeline => {
      this.timeline = timeline;
      this.drawTimeline();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Handle file drop
   */
  async onFileDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files) {
      await this.handleFiles(files);
    }
  }

  /**
   * Handle file input
   */
  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      await this.handleFiles(input.files);
      input.value = ''; // Reset input
    }
  }

  /**
   * Process selected files
   */
  private async handleFiles(files: FileList): Promise<void> {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        try {
          await this.timelineService.addTrack(file);
        } catch (error) {
          console.error('Error adding file:', file.name, error);
          alert(`Failed to load ${file.name}`);
        }
      }
    }
  }

  /**
   * Prevent default drag behavior
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle track mouse down for dragging
   */
  onTrackMouseDown(event: MouseEvent, track: AudioTrack): void {
    this.isDragging = true;
    this.draggedTrack = track;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
  }

  /**
   * Handle mouse move for dragging tracks
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedTrack || !this.timeline) {
      return;
    }

    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left - this.dragOffsetX;
    
    // Convert pixel position to time
    const newTime = Math.max(0, x / this.timeline.zoom);
    this.timelineService.updateTrackPosition(this.draggedTrack.id, newTime);
  }

  /**
   * Handle mouse up to stop dragging
   */
  onMouseUp(): void {
    this.isDragging = false;
    this.draggedTrack = undefined;
  }

  /**
   * Handle timeline click for seeking
   */
  onTimelineClick(event: MouseEvent): void {
    if (!this.timeline || this.isDragging) {
      return;
    }

    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const time = x / this.timeline.zoom;
    
    this.timelineService.seek(time);
  }

  /**
   * Draw the timeline visualization
   */
  private drawTimeline(): void {
    if (!this.canvasRef || !this.timeline) {
      return;
    }

    setTimeout(() => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || !this.timeline) return;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw playhead
      const playheadX = this.timeline.currentTime * this.timeline.zoom;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvas.height);
      ctx.stroke();
    }, 0);
  }

  /**
   * Remove a track
   */
  removeTrack(trackId: string): void {
    this.timelineService.removeTrack(trackId);
  }

  /**
   * Toggle track mute
   */
  toggleMute(trackId: string): void {
    this.timelineService.toggleTrackMute(trackId);
  }

  /**
   * Toggle track solo
   */
  toggleSolo(trackId: string): void {
    this.timelineService.toggleTrackSolo(trackId);
  }

  /**
   * Update track volume
   */
  onVolumeChange(event: Event, trackId: string): void {
    const input = event.target as HTMLInputElement;
    const volume = parseFloat(input.value);
    this.timelineService.updateTrackVolume(trackId, volume);
  }

  /**
   * Get track width in pixels
   */
  getTrackWidth(track: AudioTrack): number {
    return this.timeline ? track.duration * this.timeline.zoom : 0;
  }

  /**
   * Get track position in pixels
   */
  getTrackLeft(track: AudioTrack): number {
    return this.timeline ? track.startTime * this.timeline.zoom : 0;
  }

  /**
   * Format time for display
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get array of time markers for the ruler
   */
  getTimeMarkers(): number[] {
    if (!this.timeline) return [];
    const duration = Math.ceil(this.timeline.duration);
    return Array.from({ length: duration }, (_, i) => i);
  }
}
