import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { Timeline, AudioTrack } from '../models';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private timeline: Timeline;
  private timelineSubject: BehaviorSubject<Timeline>;
  private playbackSubscription?: Subscription;
  private playbackStartTime: number = 0;
  private pausedAt: number = 0;

  constructor(private audioService: AudioService) {
    this.timeline = new Timeline();
    this.timelineSubject = new BehaviorSubject<Timeline>(this.timeline);
  }

  /**
   * Get timeline as observable
   */
  getTimeline(): Observable<Timeline> {
    return this.timelineSubject.asObservable();
  }

  /**
   * Get current timeline state
   */
  getCurrentTimeline(): Timeline {
    return this.timeline;
  }

  /**
   * Add a new track to the timeline
   */
  async addTrack(file: File): Promise<void> {
    try {
      const track = new AudioTrack(file);
      const audioBuffer = await this.audioService.loadAudioFile(file);
      track.setAudioBuffer(audioBuffer);
      
      // Position the new track at the end of existing tracks or at 0
      if (this.timeline.tracks.length > 0) {
        const lastTrack = this.timeline.tracks[this.timeline.tracks.length - 1];
        track.setStartTime(lastTrack.getEndTime());
      }
      
      this.timeline.addTrack(track);
      this.notifyUpdate();
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  }

  /**
   * Remove a track from the timeline
   */
  removeTrack(trackId: string): void {
    this.audioService.stopTrack(trackId);
    this.timeline.removeTrack(trackId);
    this.notifyUpdate();
  }

  /**
   * Update track position on timeline
   */
  updateTrackPosition(trackId: string, startTime: number): void {
    const track = this.timeline.getTrack(trackId);
    if (track) {
      track.setStartTime(startTime);
      this.timeline.updateDuration();
      this.notifyUpdate();
    }
  }

  /**
   * Update track volume
   */
  updateTrackVolume(trackId: string, volume: number): void {
    const track = this.timeline.getTrack(trackId);
    if (track) {
      track.setVolume(volume);
      this.notifyUpdate();
    }
  }

  /**
   * Toggle track mute
   */
  toggleTrackMute(trackId: string): void {
    const track = this.timeline.getTrack(trackId);
    if (track) {
      track.toggleMute();
      
      // If currently playing, stop the track and let updatePlayback handle restarting if needed
      if (this.timeline.isPlaying) {
        this.audioService.stopTrack(trackId);
        // The track will be automatically started by updatePlayback if it should be playing
        const hasSoloTracks = this.timeline.hasAnySoloTracks();
        this.audioService.updatePlayback(
          this.timeline.tracks,
          this.timeline.currentTime,
          hasSoloTracks
        );
      }
      
      this.notifyUpdate();
    }
  }

  /**
   * Toggle track solo
   */
  toggleTrackSolo(trackId: string): void {
    const track = this.timeline.getTrack(trackId);
    if (track) {
      track.toggleSolo();
      
      // If currently playing, restart playback
      if (this.timeline.isPlaying) {
        this.pause();
        this.play();
      }
      
      this.notifyUpdate();
    }
  }

  /**
   * Play the timeline
   */
  play(): void {
    this.audioService.resumeContext();
    
    if (this.timeline.isPlaying) {
      return;
    }

    this.timeline.play();
    this.playbackStartTime = Date.now() - (this.timeline.currentTime * 1000);

    // Start playback of all tracks that should be playing now
    const hasSoloTracks = this.timeline.hasAnySoloTracks();
    this.audioService.playTracks(
      this.timeline.tracks,
      this.timeline.currentTime,
      hasSoloTracks
    );

    // Update current time every 50ms and check for new tracks to start
    this.playbackSubscription = interval(50).subscribe(() => {
      const elapsed = (Date.now() - this.playbackStartTime) / 1000;
      this.timeline.setCurrentTime(elapsed);

      // Check and start any tracks that should begin playing now
      this.audioService.updatePlayback(
        this.timeline.tracks,
        this.timeline.currentTime,
        hasSoloTracks
      );

      // Stop at the end
      if (this.timeline.currentTime >= this.timeline.duration) {
        this.stop();
      }

      this.notifyUpdate();
    });

    this.notifyUpdate();
  }

  /**
   * Pause the timeline
   */
  pause(): void {
    if (!this.timeline.isPlaying) {
      return;
    }

    this.timeline.pause();
    this.audioService.stopAll();
    this.pausedAt = this.timeline.currentTime;

    if (this.playbackSubscription) {
      this.playbackSubscription.unsubscribe();
    }

    this.notifyUpdate();
  }

  /**
   * Stop playback and reset to start
   */
  stop(): void {
    this.timeline.stop();
    this.audioService.stopAll();

    if (this.playbackSubscription) {
      this.playbackSubscription.unsubscribe();
    }

    this.notifyUpdate();
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    const wasPlaying = this.timeline.isPlaying;
    
    if (wasPlaying) {
      this.pause();
    }

    this.timeline.setCurrentTime(time);
    
    if (wasPlaying) {
      this.play();
    } else {
      this.notifyUpdate();
    }
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    this.timeline.setZoom(zoom);
    this.notifyUpdate();
  }

  /**
   * Clear all tracks
   */
  clearAll(): void {
    this.stop();
    this.timeline.clear();
    this.notifyUpdate();
  }

  /**
   * Notify subscribers of timeline updates
   */
  private notifyUpdate(): void {
    this.timelineSubject.next(this.timeline);
  }
}
