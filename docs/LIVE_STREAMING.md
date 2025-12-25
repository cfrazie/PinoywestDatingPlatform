# TikTok-Style Live Streaming Feature

## Overview
This feature implements a comprehensive live streaming system with TikTok-style multi-participant video grid, dynamic layout sizing, and host controls.

## Features

### 1. Multi-Participant Streaming
- Support for up to 9 simultaneous participants (1 host + 8 participants)
- WebRTC-based peer-to-peer video/audio streaming
- Low-latency real-time communication
- Automatic quality adaptation based on network conditions

### 2. Dynamic Grid Layouts
The layout automatically adapts based on the number of active participants:
- **1 participant**: Full screen (1x1)
- **2 participants**: 2x1 horizontal grid
- **3-4 participants**: 2x2 grid
- **5-6 participants**: 3x2 grid
- **7-9 participants**: 3x3 grid

### 3. Spotlight Mode
- Host can promote any participant to be the main/spotlight video
- Main video takes up 75% of the screen
- Other participants shown as thumbnails in a sidebar (25%)
- Smooth transitions between grid and spotlight layouts

### 4. Host Controls
As the stream host, you can:
- **Spotlight participants**: Click any participant to make them the main focus
- **Minimize participants**: Hide a participant's video from view
- **Remove participants**: Kick participants from the stream
- **Switch layouts**: Toggle between grid view and spotlight view
- **Manage stream**: Start, pause, or end the stream

### 5. Participant Features
All participants can:
- Toggle their video on/off
- Mute/unmute their microphone
- Switch between front/back camera (mobile)
- Send chat messages
- See who's speaking with visual indicators
- View connection quality indicators

### 6. Real-time Features
- Live chat during streams
- Real-time participant join/leave notifications
- Instant layout updates for all viewers
- Live viewer count
- Connection quality monitoring

## Technical Architecture

### Components
```
src/components/LiveStream/
├── LiveStreamPage.tsx       # Main streaming page
├── LiveStreamGrid.tsx       # Dynamic grid layout component
├── VideoTile.tsx            # Individual participant video tile
├── HostControls.tsx         # Host control panel
├── ParticipantList.tsx      # Participant sidebar
└── CreateStreamModal.tsx    # Stream creation modal
```

### Hooks
```
src/hooks/
├── useWebRTC.ts            # WebRTC connection management
├── useLiveStream.ts        # Stream state management
└── useStreamLayout.ts      # Layout calculation logic
```

### Services
```
src/services/
├── webrtc.service.ts       # WebRTC utilities and peer management
└── liveStream.service.ts   # Supabase integration for streams
```

### Types
```
src/types/
└── liveStream.types.ts     # TypeScript type definitions
```

## Database Schema

### Tables

#### `live_streams`
Stores main stream information:
- `id` - UUID primary key
- `host_id` - User ID of the stream host
- `title` - Stream title
- `status` - Stream status (idle, starting, live, ended, error)
- `created_at` - Stream creation timestamp
- `ended_at` - Stream end timestamp (nullable)
- `max_participants` - Maximum allowed participants (default: 9)
- `viewer_count` - Current viewer count
- `layout_type` - Current layout (grid/spotlight)
- `spotlight_user_id` - ID of spotlighted user (nullable)

#### `stream_participants`
Tracks participants in each stream:
- `id` - UUID primary key
- `stream_id` - Reference to live_streams
- `user_id` - Participant user ID
- `username` - Display name
- `avatar_url` - Profile picture URL (nullable)
- `role` - Role (host/participant)
- `is_muted` - Audio muted status
- `is_video_enabled` - Video enabled status
- `is_minimized` - Visibility status
- `joined_at` - Join timestamp
- `left_at` - Leave timestamp (nullable)

#### `stream_layout_state`
Tracks layout state changes:
- `stream_id` - Primary key, reference to live_streams
- `spotlight_user_id` - Currently spotlighted user (nullable)
- `layout_type` - Current layout type
- `updated_at` - Last update timestamp

#### `stream_chat`
Stores chat messages:
- `id` - UUID primary key
- `stream_id` - Reference to live_streams
- `user_id` - Message sender ID
- `username` - Sender display name
- `avatar_url` - Sender avatar (nullable)
- `message` - Message content
- `timestamp` - Message timestamp
- `is_host` - Whether sender is host

## Usage Guide

### Starting a Stream

1. Navigate to `/live`
2. Click "Start Stream" button
3. Enter a stream title and select max participants
4. Grant camera/microphone permissions
5. Click "Start Stream" to go live
6. Share the stream URL with participants

### Joining a Stream

1. Navigate to the stream URL (`/live/:streamId`)
2. Grant camera/microphone permissions
3. Click "Join Stream"
4. Your video will appear in the grid

### Host Controls

As the host, you have access to special controls:

**Spotlight a Participant:**
1. Click on any participant's video tile
2. They will become the main focus
3. Other participants move to thumbnails

**Return to Grid View:**
1. Click "Grid View" button in host controls
2. All participants return to equal-sized tiles

**Minimize a Participant:**
1. Click the eye icon in host controls
2. Their video is hidden from view
3. Click again to restore

**Remove a Participant:**
1. Click the remove icon in host controls
2. They are kicked from the stream

## Configuration

### Environment Variables

Required Supabase configuration in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### WebRTC Configuration

The default STUN servers are:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

To add TURN servers for better connectivity, edit `src/services/webrtc.service.ts`.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers with WebRTC support

## Performance Considerations

### Bandwidth Requirements
Per participant:
- Video (720p): ~1.5 Mbps upload/download
- Video (480p): ~0.5 Mbps upload/download
- Audio: ~50 Kbps upload/download

### Recommended Limits
- Maximum 9 participants for optimal experience
- Reduce video quality on slower connections
- Use audio-only mode to save bandwidth

## Security

### Authentication
- **Important**: The demo uses mock user IDs
- In production, replace with proper authentication
- Validate user permissions before allowing stream actions

### Privacy
- Streams require explicit camera/microphone permissions
- All WebRTC connections are peer-to-peer and encrypted
- No video/audio is stored on servers by default

## Development

### Running Tests
```bash
npm test -- src/hooks/__tests__/useStreamLayout.test.ts
```

### Building
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

## Migration

To set up the database tables:

```bash
# Using Supabase CLI
supabase db push

# Or run the migration file directly in Supabase SQL editor
# File: supabase/migrations/20251225000000_live_streaming.sql
```

## License

This feature is part of the PinoywestDatingPlatform project.
