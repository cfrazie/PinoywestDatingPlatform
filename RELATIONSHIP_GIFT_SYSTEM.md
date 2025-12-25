# Relationship Status & Gift Store System

## Overview

This comprehensive system provides transparent relationship status management and a complete gift store with support for both virtual and physical gifts. The system ensures platform integrity by making relationships public and restricting gift-giving to connected users only.

## Features Implemented

### 1. Relationship Status System

#### Relationship Statuses
- **Single** (default) - No partner linked, cannot send/receive gifts
- **Talking to Someone** - Early dating stage with mutual confirmation
- **In a Relationship** - Official relationship with full gift privileges
- **Engaged** - Pre-marriage commitment with special engagement gifts
- **Married** - Both users married to each other with exclusive gifts
- **Friends Only** - Non-romantic connection with limited gift types
- **Recently Single** - Automatic status after breakup, visible for 2 weeks

#### Key Features
- Public relationship status badges on profiles, video calls, and live streams
- Mutual confirmation required for all relationship changes
- Automatic 2-week "Recently Single" period with public visibility
- Auto-conversion to "Single" after 2 weeks
- Complete relationship history tracking
- Real-time status updates via Supabase subscriptions

### 2. Gift Store System

#### Virtual Gifts
- **Romantic Gifts**: Roses, Hearts, Diamond Ring, Fireworks, etc.
- **Friendly Gifts**: Coffee, High Five, Thumbs Up, Party Popper
- **Premium Gifts**: Luxury Car, Yacht, Private Jet, Castle

#### Physical Gifts (Planned Categories)
- Flowers & Bouquets
- Jewelry & Accessories
- Food & Chocolates
- Experience Gifts
- Tech & Gadgets
- Custom Gifts

#### Gift Features
- Country-based availability (Western + Asian countries)
- Philippines priority with expanded catalog and faster delivery
- USD and PHP pricing
- Real-time delivery tracking
- Gift sending validation based on relationship status
- Restrictions for "Single" and "Recently Single" users

### 3. Database Schema

#### Core Tables
- `relationship_statuses` - Current relationship status for each user
- `relationship_history` - Complete history of relationship changes
- `relationship_requests` - Pending and responded relationship requests
- `gift_catalog` - Available gifts with pricing and availability
- `gift_transactions` - Gift purchase and delivery tracking
- `shipping_addresses` - User shipping addresses for physical gifts
- `delivery_tracking` - Real-time delivery status updates

#### Security
- Row Level Security (RLS) policies on all tables
- User can only view/edit their own data
- Partner data visible only when connected
- Admin-only access to catalog management

### 4. Components

#### Relationship Components
- `RelationshipBadge` - Display status on profiles with clickable partner info
- `RelationshipBadgeCompact` - Compact version for video tiles
- `RelationshipBadgeProfile` - Large badge for profile headers
- `RelationshipStatusModal` - Manage status, send requests, end relationships

#### Gift Components
- `GiftStore` - Browse and filter virtual/physical gifts
- `GiftSendModal` - Send gift with validation and message
- `GiftHistory` - View sent and received gifts

### 5. Services & Hooks

#### Services
- `relationshipService.ts` - All relationship operations
- `giftService.ts` - Gift catalog and transaction management

#### Hooks
- `useRelationshipStatus` - Relationship status management with real-time updates
- `useGiftStore` - Gift browsing, validation, and sending

## Usage

### Viewing Relationship Status

```typescript
import { useRelationshipStatus } from './hooks/useRelationshipStatus';

function MyComponent() {
  const { status, statusWithPartner, loading } = useRelationshipStatus(userId);
  
  return (
    <div>
      {status && <RelationshipBadge badge={status} />}
    </div>
  );
}
```

### Sending a Relationship Request

```typescript
const { sendRequest } = useRelationshipStatus(userId);

await sendRequest(
  partnerUserId, 
  'in_relationship', 
  'Would you like to be in a relationship?'
);
```

### Browsing and Sending Gifts

```typescript
import { useGiftStore } from './hooks/useGiftStore';

function GiftPage() {
  const { catalog, validateSending, send } = useGiftStore(userId);
  
  const handleSendGift = async (giftId: string, recipientId: string) => {
    const validation = await validateSending(recipientId, giftId);
    
    if (validation?.allowed) {
      await send({
        gift_id: giftId,
        to_user_id: recipientId,
        message: 'Hope you like this!'
      });
    }
  };
}
```

## Database Migrations

Two migration files have been created:

1. **20251225221600_relationship_system.sql**
   - Creates relationship tables
   - Sets up RLS policies
   - Adds triggers for status tracking
   - Implements auto-transition function

2. **20251225221700_gift_system.sql**
   - Creates gift catalog and transaction tables
   - Sets up delivery tracking
   - Adds gift sending validation function
   - Includes sample virtual gifts

### Running Migrations

To apply migrations to your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Copy the SQL content and run in SQL Editor
```

## Validation Rules

### Gift Sending Rules

1. **Sender Requirements**:
   - Cannot be in "Recently Single" status
   - Must have active relationship status (not "Single")
   - Must be connected to recipient

2. **Recipient Requirements**:
   - Must be sender's partner or friend
   - Cannot be "Single" for romantic gifts

3. **Relationship Validation**:
   - Romantic gifts: Both must be in relationship together
   - Friendly gifts: Must be in "Friends Only" status
   - Connection must be mutually confirmed

### Relationship Rules

1. All relationship changes require mutual confirmation
2. Breakup requires date selection
3. "Recently Single" displays publicly for exactly 14 days
4. Auto-converts to "Single" after 2 weeks
5. Can be overridden if user starts new relationship

## Integration Points

### Profile Integration
Add relationship badge to user profiles:

```typescript
<RelationshipBadgeProfile 
  badge={userRelationshipData}
  onClick={() => openPartnerProfile()}
/>
```

### Video Call Integration
Display compact badge on video tiles:

```typescript
<RelationshipBadgeCompact 
  badge={participantRelationshipData}
  onClick={() => viewPartnerProfile()}
/>
```

### Gift Button Integration
Add gift button with validation:

```typescript
<button onClick={() => openGiftModal(partnerId)}>
  Send Gift
</button>
```

## Demo Page

A comprehensive demo page is available at:
```
/pages/RelationshipAndGiftsDemo.tsx
```

This page showcases:
- All relationship status badge variants
- Gift store browsing and filtering
- Gift history display
- Status management modals

## Testing

To test the relationship and gift system:

1. Create test users in Supabase
2. Set up relationship statuses via the modal
3. Browse gift catalog
4. Attempt to send gifts between users
5. Verify validation rules are enforced

## Future Enhancements

- Video gift messages
- Group gifts (multiple senders)
- Scheduled gift delivery
- Gift subscriptions
- AR gift preview
- Custom gift creation
- Gift registries for engagements/weddings

## Security Considerations

- All user data protected by RLS policies
- Relationship changes logged in history
- Gift transactions tracked for auditing
- Admin-only access to catalog management
- Input validation on all forms
- SQL injection prevention via parameterized queries

## Performance

- Indexed database queries for fast lookups
- Real-time subscriptions for status updates
- Lazy loading of gift catalog
- Pagination for large datasets
- Optimized image loading for gift thumbnails

## Support

For issues or questions:
- Check the TypeScript types for detailed interfaces
- Review service functions for API usage
- Examine components for UI patterns
- Test with demo page for examples
