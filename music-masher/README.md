# Music Masher 🎵

A powerful, web-based music editor built with Angular that allows you to import, combine, and edit multiple audio tracks on a timeline - similar to Audacity.

## Features

- **Multi-track Timeline**: Import and arrange multiple audio files on a visual timeline
- **Drag & Drop**: Easy file import via drag & drop interface
- **Track Controls**: Individual volume, mute, and solo controls for each track
- **Playback Controls**: Play, pause, stop, and seek through your project
- **Zoom Controls**: Zoom in/out on the timeline for precise editing
- **Visual Feedback**: Waveform visualization and color-coded tracks
- **Track Positioning**: Drag tracks to reposition them on the timeline

## Architecture

This project follows **Object-Oriented Programming (OOP)** principles with clear separation of concerns for maximum scalability:

### Models (`src/app/models/`)
- **AudioTrack**: Represents individual audio tracks with properties like volume, position, mute/solo state
- **Timeline**: Manages the collection of tracks and global timeline state

### Services (`src/app/services/`)
- **AudioService**: Handles Web Audio API operations (loading, decoding, playback)
- **TimelineService**: Manages timeline state and coordinates between components

### Components (`src/app/components/`)
- **TimelineComponent**: Main timeline view with track visualization
- **ControlsComponent**: Playback and zoom controls

## Technology Stack

- **Angular 19+**: Modern standalone components with signals
- **Web Audio API**: For audio processing and playback
- **RxJS**: Reactive state management
- **TypeScript**: Type-safe development
- **SCSS**: Modular styling

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Navigate to project directory
cd music-masher

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`

### Building for Production

```bash
npm run build
```

## Usage

1. **Import Audio Files**:
   - Drag & drop audio files onto the upload zone
   - Or click "Browse Files" to select files
   - Supported formats: MP3, WAV, OGG, M4A

2. **Arrange Tracks**:
   - Drag tracks horizontally to reposition them on the timeline
   - Tracks are color-coded for easy identification

3. **Control Individual Tracks**:
   - **M (Mute)**: Silence a track
   - **S (Solo)**: Play only this track
   - **Volume Slider**: Adjust track volume (0-100%)
   - **× (Delete)**: Remove track from project

4. **Playback Controls**:
   - **Play/Pause**: Start or pause playback
   - **Stop**: Stop and return to beginning
   - **Timeline Click**: Seek to specific time

5. **Zoom Controls**:
   - **+ (Zoom In)**: See more detail
   - **− (Zoom Out)**: See more of the timeline
   - **↺ (Reset)**: Return to default zoom

## Project Structure

```
music-masher/
├── src/
│   ├── app/
│   │   ├── models/                 # Data models
│   │   │   ├── audio-track.model.ts
│   │   │   ├── timeline.model.ts
│   │   │   └── index.ts
│   │   ├── services/               # Business logic
│   │   │   ├── audio.service.ts
│   │   │   └── timeline.service.ts
│   │   ├── components/             # UI components
│   │   │   ├── timeline/
│   │   │   │   ├── timeline.component.ts
│   │   │   │   ├── timeline.component.html
│   │   │   │   └── timeline.component.scss
│   │   │   └── controls/
│   │   │       ├── controls.component.ts
│   │   │       ├── controls.component.html
│   │   │       └── controls.component.scss
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.scss
│   └── styles.scss                 # Global styles
└── README.md
```

## Design Decisions

### OOP Approach
- **Encapsulation**: Each class has clear responsibilities
- **Separation of Concerns**: Models, services, and components are isolated
- **Scalability**: Easy to add new features (effects, filters, export, etc.)

### State Management
- Uses RxJS BehaviorSubject for reactive state updates
- Centralized state in TimelineService
- Components subscribe to state changes

### Web Audio API
- Modern browser API for audio processing
- Low-latency playback
- Support for multiple simultaneous audio sources

## Future Enhancements

- [ ] **Audio Effects**: Add reverb, delay, EQ, compression
- [ ] **Cut/Copy/Paste**: Edit sections of tracks
- [ ] **Export/Mix Down**: Render final audio to file
- [ ] **Undo/Redo**: Track editing history
- [ ] **Waveform Visualization**: Display actual audio waveforms
- [ ] **Snap to Grid**: Align tracks to beat markers
- [ ] **Keyboard Shortcuts**: Quick access to common functions
- [ ] **Project Save/Load**: Persist projects to file
- [ ] **Track Fading**: Fade in/out effects
- [ ] **Time Stretching**: Change tempo without affecting pitch

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Note: Requires browsers with Web Audio API support

## License

MIT License - Feel free to use this project for learning and development!

## Contributing

Contributions are welcome! The OOP architecture makes it easy to add new features:

1. Fork the repository
2. Create a feature branch
3. Follow the existing code structure
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Angular and the Web Audio API
