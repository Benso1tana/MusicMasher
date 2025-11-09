import { Injectable } from '@angular/core';
import { AudioTrack } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext;
  private masterGainNode: GainNode;
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();

  constructor() {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
  }

  /**
   * Load an audio file and decode it into an AudioBuffer
   */
  async loadAudioFile(file: File): Promise<AudioBuffer> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw new Error('Failed to load audio file');
    }
  }

  /**
   * Play a single track at a specific timeline time
   * @param track The track to play
   * @param timelineTime The current timeline time
   * @param contextStartTime Optional AudioContext time to start playback (for synchronization)
   */
  playTrack(track: AudioTrack, timelineTime: number = 0, contextStartTime?: number): AudioBufferSourceNode | null {
    if (!track.audioBuffer || track.isMuted) {
      return null;
    }

    // Calculate if track should be playing at this timeline time
    if (timelineTime < track.startTime || timelineTime >= track.getEndTime()) {
      return null;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = track.audioBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = track.volume;

    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Calculate offset into the track's audio buffer
    const bufferOffset = Math.max(0, timelineTime - track.startTime);
    
    // Calculate when to start in AudioContext time
    // If contextStartTime is provided, use it; otherwise start immediately with a small delay
    const startTime = contextStartTime !== undefined 
      ? contextStartTime 
      : this.audioContext.currentTime + 0.01; // Small delay to ensure source is ready
    
    // Only start if we haven't reached the end of the track
    if (bufferOffset < track.duration) {
      source.start(startTime, bufferOffset);
      this.activeSources.set(track.id, source);
      return source;
    }

    return null;
  }

  /**
   * Play multiple tracks simultaneously with proper synchronization
   * Only starts tracks that aren't already playing to avoid restarting
   */
  playTracks(tracks: AudioTrack[], currentTime: number, hasSoloTracks: boolean): void {
    // Get tracks that should be playing right now but aren't already playing
    const tracksToStart = tracks.filter(track => {
      // Skip if already playing
      if (this.activeSources.has(track.id)) {
        return false;
      }

      // Skip if no audio buffer
      if (!track.audioBuffer) {
        return false;
      }

      // Skip if muted
      if (track.isMuted) {
        return false;
      }

      // If there are solo tracks, only play solo tracks
      if (hasSoloTracks && !track.isSolo) {
        return false;
      }

      // Track should be playing if currentTime is within its range
      return currentTime >= track.startTime && currentTime < track.getEndTime();
    });

    if (tracksToStart.length === 0) {
      return;
    }

    // Use a single AudioContext time for all tracks to ensure perfect synchronization
    // Use a consistent small delay to batch tracks detected in the same update cycle
    const syncStartTime = this.audioContext.currentTime + 0.05;

    // Prepare all sources first, then start them all at once
    const sourcesToStart: Array<{source: AudioBufferSourceNode; trackId: string; bufferOffset: number}> = [];
    
    tracksToStart.forEach(track => {
      if (!track.audioBuffer) {
        return;
      }

      // Calculate how far into the track we are
      // Use the track's startTime to calculate the offset, not currentTime
      // This ensures tracks that start at the same timeline time start at the same buffer position
      const bufferOffset = Math.max(0, currentTime - track.startTime);
      
      // Don't start if we're past the end
      if (bufferOffset >= track.duration) {
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = track.audioBuffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = track.volume;

      source.connect(gainNode);
      gainNode.connect(this.masterGainNode);

      sourcesToStart.push({
        source,
        trackId: track.id,
        bufferOffset
      });
    });

    // Start all tracks at the exact same AudioContext time for perfect synchronization
    sourcesToStart.forEach(({source, trackId, bufferOffset}) => {
      source.start(syncStartTime, bufferOffset);
      this.activeSources.set(trackId, source);

      // Clean up when track ends
      source.addEventListener('ended', () => {
        this.activeSources.delete(trackId);
      });
    });
  }

  /**
   * Check and start any tracks that should begin playing at the current time
   * This is called periodically to start tracks as they become active
   */
  updatePlayback(tracks: AudioTrack[], currentTime: number, hasSoloTracks: boolean): void {
    // This will only start tracks that aren't already playing
    this.playTracks(tracks, currentTime, hasSoloTracks);
  }

  /**
   * Stop all currently playing audio sources
   */
  stopAll(): void {
    this.activeSources.forEach((source, trackId) => {
      try {
        source.stop();
      } catch (error) {
        // Source may have already stopped
        console.warn(`Could not stop source for track ${trackId}:`, error);
      }
    });
    this.activeSources.clear();
  }

  /**
   * Stop a specific track
   */
  stopTrack(trackId: string): void {
    const source = this.activeSources.get(trackId);
    if (source) {
      try {
        source.stop();
      } catch (error) {
        console.warn(`Could not stop track ${trackId}:`, error);
      }
      this.activeSources.delete(trackId);
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get audio context current time
   */
  getCurrentTime(): number {
    return this.audioContext.currentTime;
  }

  /**
   * Resume audio context if suspended (required for some browsers)
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Get visualization data for a track
   */
  getWaveformData(track: AudioTrack, width: number): Float32Array | null {
    if (!track.audioBuffer) {
      return null;
    }

    const rawData = track.audioBuffer.getChannelData(0);
    const samples = width;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      
      filteredData[i] = sum / blockSize;
    }

    return filteredData;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAll();
    this.audioContext.close();
  }
}
