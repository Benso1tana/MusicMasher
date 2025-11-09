import { AudioTrack } from './audio-track.model';

export class Timeline {
  tracks: AudioTrack[];
  currentTime: number;
  zoom: number; // pixels per second
  isPlaying: boolean;
  bpm: number;
  duration: number;

  constructor() {
    this.tracks = [];
    this.currentTime = 0;
    this.zoom = 50; // 50 pixels per second by default
    this.isPlaying = false;
    this.bpm = 120;
    this.duration = 0;
  }

  addTrack(track: AudioTrack): void {
    this.tracks.push(track);
    this.updateDuration();
  }

  removeTrack(trackId: string): void {
    this.tracks = this.tracks.filter(track => track.id !== trackId);
    this.updateDuration();
  }

  getTrack(trackId: string): AudioTrack | undefined {
    return this.tracks.find(track => track.id === trackId);
  }

  updateDuration(): void {
    if (this.tracks.length === 0) {
      this.duration = 0;
      return;
    }
    
    const maxEndTime = Math.max(
      ...this.tracks.map(track => track.getEndTime())
    );
    this.duration = Math.max(maxEndTime, 60); // Minimum 60 seconds
  }

  setCurrentTime(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(10, Math.min(200, zoom)); // Between 10 and 200 pixels per second
  }

  play(): void {
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
  }

  stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
  }

  getActiveTracks(time: number): AudioTrack[] {
    return this.tracks.filter(track => {
      return time >= track.startTime && time < track.getEndTime();
    });
  }

  getSoloTracks(): AudioTrack[] {
    return this.tracks.filter(track => track.isSolo);
  }

  hasAnySoloTracks(): boolean {
    return this.tracks.some(track => track.isSolo);
  }

  clear(): void {
    this.tracks = [];
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
  }
}
