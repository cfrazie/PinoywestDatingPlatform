# Culture Wall Feature Documentation

## Overview

The Culture Wall is a comprehensive social feed system for the Pinoywest Dating Platform that includes advanced user verification, location intelligence with OFW (Overseas Filipino Worker) support, and automated cultural do's/don'ts from Wikipedia integration.

## Features

### 1. Culture Wall - Social Feed System

A rich social media-style feed where users can:
- Create posts (text, photo, video, link, poll, story, event)
- Categorize content (food, traditions, travel, dating_tips, language, festivals, etc.)
- Use hashtags for discovery
- Control visibility (public, couples_only, friends_only, private)
- Engage with content (like, comment, share, save, report)
- View real-time updates

### 2. Advanced Image Verification

Multi-layered verification system that checks:
- ✓ Photo is not a stock image
- ✓ Photo is not AI-generated
- ✓ Photo is not found on other dating platforms
- ✓ Photo is not found on adult content sites
- ✓ Photo was taken with a real camera (EXIF data check)

**Risk Scoring**: Automated risk assessment with levels: low, medium, high, critical

### 3. Location Intelligence with OFW Support

Smart location detection and management:
- IP-based auto-detection
- Manual location entry
- Multiple locations per user (home, current, work, travel)
- **OFW Support**: Special features for Overseas Filipino Workers
  - Host country tracking
  - Occupation and visa type
  - Return date planning
  - OFW community connections

### 4. Cultural Do's & Don'ts

Wikipedia-sourced cultural guidelines:
- Categories: greetings, dining, dating, family, religion, communication, business, public behavior, gifts, taboos
- Importance levels: critical, important, good_to_know, optional
- User feedback system (helpful/not helpful)
- Searchable and filterable
- Country pair comparisons for cross-cultural dating

## Database Schema

### Core Tables

1. **culture_wall_posts** - Main posts with engagement metrics
2. **culture_wall_comments** - Nested comments with threading
3. **culture_wall_reactions** - Multi-type reactions (like, love, helpful, etc.)
4. **culture_wall_hashtags** - Hashtag usage tracking
5. **culture_wall_saved_posts** - Bookmarking system
6. **culture_wall_shares** - Share tracking
7. **culture_wall_reports** - Content moderation
8. **user_locations** - User locations with OFW support
9. **ip_location_history** - IP tracking for location detection
10. **user_verification_requests** - Image verification records
11. **image_match_detections** - Reverse search results
12. **social_media_verifications** - OAuth social linking
13. **cultural_guidelines** - Do's and don'ts
14. **user_cultural_insights** - Personalized recommendations
15. **content_moderation_logs** - Safety tracking

## Edge Functions

### 1. verify-user-image

**Endpoint**: `/functions/v1/verify-user-image`

Processes image verification requests with:
- EXIF data extraction
- Phone camera detection
- Reverse image search (mock - ready for API integration)
- Risk score calculation
- Platform detection tracking

**Request**:
```json
{
  "userId": "uuid",
  "imageUrl": "https://...",
  "imageHash": "optional-hash",
  "verificationType": "phone_camera"
}
```

**Response**:
```json
{
  "success": true,
  "verification": { /* verification request object */ },
  "riskAssessment": {
    "riskScore": 15,
    "riskLevel": "low",
    "factors": ["Photo taken with phone camera (positive indicator)"],
    "platforms": []
  }
}
```

### 2. fetch-cultural-data

**Endpoint**: `/functions/v1/fetch-cultural-data`

Fetches cultural guidelines from Wikipedia:

**Request**:
```json
{
  "country": "Philippines",
  "region": "optional"
}
```

### 3. detect-location

**Endpoint**: `/functions/v1/detect-location`

Detects user location from IP address:

**Request**:
```json
{
  "userId": "uuid",
  "ipAddress": "optional"
}
```

## Services

### cultureWallService

- `getPosts()` - Fetch posts with filters
- `createPost()` - Create new post
- `getComments()` - Get post comments
- `createComment()` - Add comment
- `addReaction()` - React to post/comment
- `savePost()` - Bookmark post
- `sharePost()` - Share post
- `reportContent()` - Report inappropriate content
- `subscribeToPostUpdates()` - Real-time feed updates
- `subscribeToCommentUpdates()` - Real-time comment updates

### verificationService

- `submitImageVerification()` - Submit photo for verification
- `getVerificationStatus()` - Get user verification status
- `getSocialVerifications()` - Get linked social media
- `addSocialVerification()` - Link social media account
- `getVerificationScore()` - Calculate verification score (0-100)

### locationService

- `detectLocationFromIP()` - Auto-detect location
- `getUserLocations()` - Get all user locations
- `createLocation()` - Add new location
- `setPrimaryLocation()` - Set primary location
- `isOFW()` - Check if user is OFW
- `getOFWLocations()` - Get OFW community

### culturalService

- `fetchGuidelinesFromWikipedia()` - Import guidelines
- `getGuidelines()` - Get filtered guidelines
- `getGuidelinesForCountryPair()` - Compare two countries
- `submitGuidelineFeedback()` - Vote helpful/not helpful
- `generateInsights()` - Create personalized insights
- `getDosAndDonts()` - Get do's and don'ts separately
- `searchGuidelines()` - Search guidelines

## React Components

### CultureWallFeed
Main feed component with infinite scroll and real-time updates.

**Props**:
- `feedType`: 'discover' | 'following' | 'trending' | 'local' | 'topics'
- `userId`: Optional user filter
- `category`: Optional category filter

### CreatePostModal
Post creation dialog with media upload support.

**Props**:
- `onClose`: () => void
- `onPostCreated`: (post) => void

### PostCard
Individual post display with engagement actions.

**Props**:
- `post`: CultureWallPost

### CommentSection
Comment thread with real-time updates.

**Props**:
- `postId`: string

### CulturalDosDonts
Cultural guidelines browser with search and filters.

**Props**:
- `country`: string
- `partnerCountry`: Optional string

### LocationSetup
Location setup wizard with OFW support.

**Props**:
- `userId`: string
- `onComplete`: Optional callback

### ImageVerificationFlow
Multi-step image verification process.

**Props**:
- `userId`: string
- `onComplete`: Optional callback

## Usage Examples

### Display Culture Wall Feed

```tsx
import { CultureWallFeed } from '@/components/cultureWall';

function HomePage() {
  return <CultureWallFeed feedType="discover" />;
}
```

### Add Location Setup

```tsx
import { LocationSetup } from '@/components/cultureWall';

function OnboardingPage() {
  const userId = useAuth().user.id;
  
  return (
    <LocationSetup
      userId={userId}
      onComplete={() => navigate('/dashboard')}
    />
  );
}
```

### Show Cultural Guidelines

```tsx
import { CulturalDosDonts } from '@/components/cultureWall';

function CulturalGuide() {
  return (
    <CulturalDosDonts
      country="Philippines"
      partnerCountry="United States"
    />
  );
}
```

### Verification Flow

```tsx
import { ImageVerificationFlow } from '@/components/cultureWall';

function VerificationPage() {
  const userId = useAuth().user.id;
  
  return (
    <ImageVerificationFlow
      userId={userId}
      onComplete={() => navigate('/profile')}
    />
  );
}
```

## Security & Privacy

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Users can view their own data
- Public posts visible to all
- Private data restricted to owners
- Admin-only access for moderation

### Content Moderation

- Automated risk assessment
- User reporting system
- Admin moderation dashboard (to be implemented)
- Cultural sensitivity detection

### Privacy Compliance

- GDPR-compliant IP tracking
- User consent for verification
- Right to deletion
- Transparent verification process
- Appeal process for rejected verifications

## Production Setup

### Required API Keys

Add these to your `.env` file:

```env
# IP Geolocation (choose one)
VITE_IPAPI_KEY=your_key_here
# or
VITE_IP_API_KEY=your_key_here

# Image Verification (optional but recommended)
VITE_GOOGLE_VISION_KEY=your_key_here
VITE_TINEYE_KEY=your_key_here
VITE_PIMEYES_KEY=your_key_here

# Social Media OAuth
VITE_FACEBOOK_APP_ID=your_app_id
VITE_INSTAGRAM_CLIENT_ID=your_client_id
# etc.
```

### Supabase Storage Setup

1. Create buckets:
   - `culture-wall-media`
   - `verification-images`

2. Set permissions:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'culture-wall-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public media is viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'culture-wall-media');
```

### Rate Limiting

Implement rate limiting for:
- Post creation: 10 posts per hour
- Comments: 30 comments per hour
- Reactions: 100 per hour
- Reports: 5 per hour

## Future Enhancements

- [ ] Video selfie verification
- [ ] Live streaming support
- [ ] Poll and event post types
- [ ] Advanced hashtag analytics
- [ ] Cultural compatibility scoring
- [ ] OFW-specific features (remittance tracking, return date countdown)
- [ ] AI-powered content moderation
- [ ] Multi-language support
- [ ] Mobile app integration

## Support

For issues or questions, please contact the development team or create an issue in the repository.
