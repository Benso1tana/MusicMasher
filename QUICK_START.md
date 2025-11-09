# Music Masher - Quick Start Guide

## 📦 Installation

1. Extract the project archive
2. Navigate to the project directory:
   ```bash
   cd music-masher
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser to `http://localhost:4200`

## 🎯 Project Architecture Overview

### **OOP Design Pattern**

The project follows a clean OOP architecture with three main layers:

```
┌─────────────────────────────────────────┐
│           COMPONENTS LAYER              │
│  (UI & User Interaction)                │
│  - TimelineComponent                    │
│  - ControlsComponent                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           SERVICES LAYER                │
│  (Business Logic & State Management)    │
│  - TimelineService                      │
│  - AudioService                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            MODELS LAYER                 │
│  (Data Structures)                      │
│  - AudioTrack                           │
│  - Timeline                             │
└─────────────────────────────────────────┘
```

### **Key Classes**

#### 1. **AudioTrack Model** (`src/app/models/audio-track.model.ts`)
Encapsulates all properties and behaviors of a single audio track:
- Properties: id, name, audioBuffer, startTime, duration, volume, isMuted, isSolo, color
- Methods: setVolume(), toggleMute(), toggleSolo(), getEndTime(), clone()

#### 2. **Timeline Model** (`src/app/models/timeline.model.ts`)
Manages the collection of tracks and timeline state:
- Properties: tracks[], currentTime, zoom, isPlaying, duration
- Methods: addTrack(), removeTrack(), play(), pause(), stop(), setZoom()

#### 3. **AudioService** (`src/app/services/audio.service.ts`)
Handles all Web Audio API operations:
- loadAudioFile(): Loads and decodes audio files
- playTrack(): Plays a single track
- playTracks(): Plays multiple tracks simultaneously
- stopAll(): Stops all playback
- getWaveformData(): Extracts visualization data

#### 4. **TimelineService** (`src/app/services/timeline.service.ts`)
Manages timeline state and coordinates between components:
- Uses RxJS BehaviorSubject for reactive state
- Handles track CRUD operations
- Manages playback coordination
- Provides centralized state management

## 🎨 Feature Highlights

### 1. **Multi-track Timeline**
- Import multiple audio files
- Visual representation with color-coding
- Drag and drop to reposition tracks

### 2. **Individual Track Controls**
- **Mute (M)**: Silence a track without removing it
- **Solo (S)**: Listen to only this track
- **Volume slider**: Fine-tune volume (0-100%)
- **Delete (×)**: Remove track from project

### 3. **Playback Controls**
- **Play/Pause**: Toggle playback
- **Stop**: Return to beginning
- **Seek**: Click timeline to jump to any position
- **Real-time position tracking**: Visual playhead indicator

### 4. **Zoom Controls**
- **Zoom In (+)**: See more detail
- **Zoom Out (−)**: See longer duration
- **Reset (↺)**: Return to default view

## 🔧 Extending the Application

### Adding a New Feature (Example: Track Effects)

1. **Create Effect Model** (`models/audio-effect.model.ts`):
```typescript
export class AudioEffect {
  type: string;
  parameters: Map<string, number>;
  
  apply(audioContext: AudioContext): AudioNode {
    // Implementation
  }
}
```

2. **Extend AudioTrack Model**:
```typescript
export class AudioTrack {
  // ... existing properties
  effects: AudioEffect[];
  
  addEffect(effect: AudioEffect): void {
    this.effects.push(effect);
  }
}
```

3. **Update AudioService**:
```typescript
playTrack(track: AudioTrack): void {
  // ... existing code
  
  // Apply effects chain
  track.effects.forEach(effect => {
    const effectNode = effect.apply(this.audioContext);
    source.connect(effectNode);
  });
}
```

4. **Create Effects Component**:
```typescript
@Component({
  selector: 'app-effects-panel',
  // ... component code
})
export class EffectsPanelComponent { }
```

## 🎵 Supported Audio Formats

- **MP3** (.mp3)
- **WAV** (.wav)
- **OGG** (.ogg)
- **M4A** (.m4a)
- **FLAC** (.flac) - if browser supports

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

*Requires Web Audio API support*

## 🐛 Troubleshooting

### Audio not playing?
- Check browser console for errors
- Ensure audio files are valid
- Try clicking the page first (some browsers require user interaction)

### Tracks not loading?
- Verify file format is supported
- Check file isn't corrupted
- Try a smaller file first

### Performance issues?
- Reduce zoom level
- Close other browser tabs
- Try fewer simultaneous tracks

## 📚 Next Steps

Ready to add more features? Here are some ideas:

1. **Export Functionality**: Mix down to a single file
2. **Waveform Visualization**: Show actual audio waveforms
3. **Audio Effects**: Reverb, delay, EQ, compression
4. **Cut/Copy/Paste**: Edit track sections
5. **Undo/Redo**: Track editing history
6. **Keyboard Shortcuts**: Space for play/pause, etc.

Check the README.md for more detailed documentation!

---

**Happy Music Mashing! 🎶**
