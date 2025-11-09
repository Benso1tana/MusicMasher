export class AudioTrack {
  id: string;
  name: string;
  audioBuffer: AudioBuffer | null;
  file: File;
  startTime: number; // Position on timeline in seconds
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  isSolo: boolean;
  color: string;

  constructor(file: File, id?: string) {
    this.id = id || this.generateId();
    this.name = file.name;
    this.file = file;
    this.audioBuffer = null;
    this.startTime = 0;
    this.duration = 0;
    this.volume = 1.0;
    this.isMuted = false;
    this.isSolo = false;
    this.color = this.generateRandomColor();
  }

  private generateId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  setAudioBuffer(buffer: AudioBuffer): void {
    this.audioBuffer = buffer;
    this.duration = buffer.duration;
  }

  setStartTime(time: number): void {
    this.startTime = Math.max(0, time);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  toggleSolo(): void {
    this.isSolo = !this.isSolo;
  }

  getEndTime(): number {
    return this.startTime + this.duration;
  }

  clone(): AudioTrack {
    const cloned = new AudioTrack(this.file, `${this.id}_clone`);
    cloned.audioBuffer = this.audioBuffer;
    cloned.startTime = this.startTime;
    cloned.duration = this.duration;
    cloned.volume = this.volume;
    cloned.isMuted = this.isMuted;
    cloned.isSolo = this.isSolo;
    cloned.color = this.color;
    return cloned;
  }
}
