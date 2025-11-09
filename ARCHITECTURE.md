# Music Masher - Architecture Documentation

## 🏗️ System Architecture

This document provides an in-depth look at the Music Masher architecture, explaining the OOP design decisions and how components interact.

## Overview

Music Masher follows a **layered architecture** pattern with clear separation of concerns:

```
┌───────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
│  ┌─────────────────────┐     ┌──────────────────────┐    │
│  │ TimelineComponent   │     │ ControlsComponent    │    │
│  │ - UI Rendering      │     │ - Playback Controls  │    │
│  │ - User Interaction  │     │ - Zoom Controls      │    │
│  └─────────────────────┘     └──────────────────────┘    │
└──────────────────────┬────────────────────────────────────┘
                       │ Observables (RxJS)
┌──────────────────────┴────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                    │
│  ┌─────────────────────┐     ┌──────────────────────┐    │
│  │ TimelineService     │     │ AudioService         │    │
│  │ - State Management  │     │ - Web Audio API      │    │
│  │ - Coordination      │     │ - Audio Processing   │    │
│  └─────────────────────┘     └──────────────────────┘    │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────┴────────────────────────────────────┐
│                      DATA LAYER                            │
│  ┌─────────────────────┐     ┌──────────────────────┐    │
│  │ Timeline Model      │     │ AudioTrack Model     │    │
│  │ - Track Collection  │     │ - Track Properties   │    │
│  │ - Playback State    │     │ - Track Behaviors    │    │
│  └─────────────────────┘     └──────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. **Single Responsibility Principle (SRP)**
Each class has one reason to change:
- `AudioTrack`: Represents a single audio track
- `Timeline`: Manages track collection
- `AudioService`: Handles audio operations
- `TimelineService`: Manages application state

### 2. **Dependency Injection**
Angular's DI system provides services to components:
```typescript
constructor(private timelineService: TimelineService) {}
```

### 3. **Observer Pattern**
Uses RxJS for reactive state management:
```typescript
// Service publishes state changes
private timelineSubject = new BehaviorSubject<Timeline>(this.timeline);

// Components subscribe to changes
this.timelineService.getTimeline().subscribe(timeline => { ... });
```

### 4. **Encapsulation**
Internal state is protected, exposed through methods:
```typescript
export class AudioTrack {
  private id: string;  // Private
  
  getId(): string {    // Public accessor
    return this.id;
  }
}
```

## Data Flow

### Loading a Track

```
User Action (Drop File)
         ↓
TimelineComponent.onFileDrop()
         ↓
TimelineService.addTrack(file)
         ↓
AudioService.loadAudioFile(file) → Returns AudioBuffer
         ↓
Create AudioTrack instance
         ↓
Timeline.addTrack(track)
         ↓
Notify subscribers (BehaviorSubject.next())
         ↓
Components re-render with new state
```

### Playing Audio

```
User clicks Play button
         ↓
ControlsComponent.togglePlayPause()
         ↓
TimelineService.play()
         ↓
Timeline.play() (update state)
         ↓
AudioService.playTracks(tracks, currentTime)
         ↓
For each track:
  - Create AudioBufferSourceNode
  - Connect to GainNode (for volume)
  - Connect to destination
  - Start playback
         ↓
Interval updates currentTime
         ↓
Notify subscribers
         ↓
UI updates (playhead moves)
```

## Class Diagrams

### AudioTrack Class

```typescript
class AudioTrack {
  // Properties
  - id: string
  - name: string
  - audioBuffer: AudioBuffer | null
  - file: File
  - startTime: number
  - duration: number
  - volume: number (0-1)
  - isMuted: boolean
  - isSolo: boolean
  - color: string
  
  // Constructor
  + constructor(file: File, id?: string)
  
  // Public Methods
  + setAudioBuffer(buffer: AudioBuffer): void
  + setStartTime(time: number): void
  + setVolume(volume: number): void
  + toggleMute(): void
  + toggleSolo(): void
  + getEndTime(): number
  + clone(): AudioTrack
  
  // Private Methods
  - generateId(): string
  - generateRandomColor(): string
}
```

### Timeline Class

```typescript
class Timeline {
  // Properties
  + tracks: AudioTrack[]
  + currentTime: number
  + zoom: number
  + isPlaying: boolean
  + bpm: number
  + duration: number
  
  // Constructor
  + constructor()
  
  // Track Management
  + addTrack(track: AudioTrack): void
  + removeTrack(trackId: string): void
  + getTrack(trackId: string): AudioTrack | undefined
  
  // Playback Control
  + play(): void
  + pause(): void
  + stop(): void
  + setCurrentTime(time: number): void
  
  // View Control
  + setZoom(zoom: number): void
  + updateDuration(): void
  
  // Queries
  + getActiveTracks(time: number): AudioTrack[]
  + getSoloTracks(): AudioTrack[]
  + hasAnySoloTracks(): boolean
  + clear(): void
}
```

### AudioService

```typescript
class AudioService {
  // Properties
  - audioContext: AudioContext
  - masterGainNode: GainNode
  - activeSources: Map<string, AudioBufferSourceNode>
  
  // Audio Loading
  + async loadAudioFile(file: File): Promise<AudioBuffer>
  
  // Playback Control
  + playTrack(track: AudioTrack, startTime: number): AudioBufferSourceNode | null
  + playTracks(tracks: AudioTrack[], currentTime: number, hasSoloTracks: boolean): void
  + stopAll(): void
  + stopTrack(trackId: string): void
  
  // Audio Control
  + setMasterVolume(volume: number): void
  + async resumeContext(): Promise<void>
  
  // Utilities
  + getWaveformData(track: AudioTrack, width: number): Float32Array | null
  + getCurrentTime(): number
  + destroy(): void
}
```

### TimelineService

```typescript
class TimelineService {
  // Properties
  - timeline: Timeline
  - timelineSubject: BehaviorSubject<Timeline>
  - playbackSubscription?: Subscription
  - playbackStartTime: number
  - pausedAt: number
  
  // State Access
  + getTimeline(): Observable<Timeline>
  + getCurrentTimeline(): Timeline
  
  // Track Management
  + async addTrack(file: File): Promise<void>
  + removeTrack(trackId: string): void
  + updateTrackPosition(trackId: string, startTime: number): void
  
  // Track Controls
  + updateTrackVolume(trackId: string, volume: number): void
  + toggleTrackMute(trackId: string): void
  + toggleTrackSolo(trackId: string): void
  
  // Playback Control
  + play(): void
  + pause(): void
  + stop(): void
  + seek(time: number): void
  
  // View Control
  + setZoom(zoom: number): void
  + clearAll(): void
  
  // Private Methods
  - notifyUpdate(): void
}
```

## State Management

### Reactive State Flow

```typescript
// 1. Service maintains state
private timeline: Timeline;
private timelineSubject: BehaviorSubject<Timeline>;

// 2. Components subscribe
this.timelineService.getTimeline().subscribe(timeline => {
  this.timeline = timeline;
  this.updateView();
});

// 3. User action triggers update
userAction() {
  this.timeline.someProperty = newValue;
  this.notifyUpdate();  // Emit new state
}

// 4. All subscribers receive update
private notifyUpdate(): void {
  this.timelineSubject.next(this.timeline);
}
```

### Benefits:
- **Unidirectional data flow**: Easier to debug
- **Automatic updates**: Components update when state changes
- **Decoupling**: Components don't need to know about each other

## Web Audio API Integration

### Audio Graph Structure

```
AudioBufferSourceNode (Track 1) ──→ GainNode (Volume) ──┐
                                                          │
AudioBufferSourceNode (Track 2) ──→ GainNode (Volume) ──┤
                                                          ├──→ MasterGainNode ──→ Destination (Speakers)
AudioBufferSourceNode (Track 3) ──→ GainNode (Volume) ──┤
                                                          │
AudioBufferSourceNode (Track 4) ──→ GainNode (Volume) ──┘
```

### Audio Processing Pipeline

1. **Load**: File → ArrayBuffer → AudioBuffer
2. **Play**: AudioBuffer → BufferSourceNode → GainNode → MasterGain → Speakers
3. **Control**: Adjust GainNode values for volume control
4. **Synchronize**: Start all sources at calculated offsets for sync

## Scalability Considerations

### Adding New Features

#### Example: Audio Effects Chain

```typescript
// 1. Create Effect interface
interface IAudioEffect {
  apply(context: AudioContext, input: AudioNode): AudioNode;
}

// 2. Implement specific effects
class ReverbEffect implements IAudioEffect {
  apply(context: AudioContext, input: AudioNode): AudioNode {
    const convolver = context.createConvolver();
    // Configure convolver...
    input.connect(convolver);
    return convolver;
  }
}

// 3. Extend AudioTrack
class AudioTrack {
  effects: IAudioEffect[] = [];
  
  addEffect(effect: IAudioEffect): void {
    this.effects.push(effect);
  }
}

// 4. Update AudioService
playTrack(track: AudioTrack): void {
  let audioNode = source;
  
  // Chain effects
  track.effects.forEach(effect => {
    audioNode = effect.apply(this.audioContext, audioNode);
  });
  
  audioNode.connect(this.masterGainNode);
}
```

### Performance Optimization

1. **Virtual Scrolling**: For many tracks
2. **Canvas Rendering**: For waveform visualization
3. **Web Workers**: For intensive processing
4. **Lazy Loading**: Load audio data on demand

## Testing Strategy

### Unit Tests
- **Models**: Test business logic in isolation
- **Services**: Mock dependencies, test state management
- **Components**: Test user interactions

### Example:
```typescript
describe('AudioTrack', () => {
  it('should toggle mute state', () => {
    const track = new AudioTrack(mockFile);
    expect(track.isMuted).toBe(false);
    track.toggleMute();
    expect(track.isMuted).toBe(true);
  });
});
```

## Conclusion

This architecture provides:
- ✅ **Maintainability**: Clear responsibilities
- ✅ **Scalability**: Easy to extend
- ✅ **Testability**: Components can be tested in isolation
- ✅ **Reusability**: Services can be used across features
- ✅ **Type Safety**: TypeScript catches errors at compile time

The OOP approach with Angular's dependency injection creates a robust foundation for building a professional audio editing application.
