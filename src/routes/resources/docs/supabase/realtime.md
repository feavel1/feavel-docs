---
id: 'getting-started'
title: 'Getting Started with Realtime'
description: 'Learn how to build real-time applications with Supabase Realtime'
subtitle: 'Learn how to build real-time applications with Supabase Realtime'
sidebar_label: 'Getting Started'
---

## Quick start

### 1. Install the client library

```bash
npm install @supabase/supabase-js
```

### 2. Initialize the client

Get your project URL and key.

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://<project>.supabase.co', '<anon_key or sb_publishable_key>');
```

### 3. Create your first Channel

Channels are the foundation of Realtime. Think of them as rooms where clients can communicate. Each channel is identified by a topic name and if they are public or private.

```ts
// Create a channel with a descriptive topic name
const channel = supabase.channel('room:lobby:messages', {
	config: { private: true } // Recommended for production
});
```

### 4. Set up authorization

Since we're using a private channel, you need to create a basic RLS policy on the `realtime.messages` table to allow authenticated users to connect. Row Level Security (RLS) policies control who can access your Realtime channels based on user authentication and custom rules:

```sql
-- Allow authenticated users to receive broadcasts
CREATE POLICY "authenticated_users_can_receive" ON realtime.messages
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to send broadcasts
CREATE POLICY "authenticated_users_can_send" ON realtime.messages
  FOR INSERT TO authenticated WITH CHECK (true);
```

### 5. Send and receive messages

There are three main ways to send messages with Realtime:

#### 5.1 using client libraries

Send and receive messages using the Supabase client:

```ts
// Listen for messages
channel
	.on('broadcast', { event: 'message_sent' }, (payload: { payload: any }) => {
		console.log('New message:', payload.payload);
	})
	.subscribe();

// Send a message
channel.send({
	type: 'broadcast',
	event: 'message_sent',
	payload: {
		text: 'Hello, world!',
		user: 'john_doe',
		timestamp: new Date().toISOString()
	}
});
```

#### 5.2 using HTTP/REST API

Send messages via HTTP requests, perfect for server-side applications:

```ts
// Send message via REST API
const response = await fetch(`https://<project>.supabase.co/rest/v1/rpc/broadcast`, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer <your-service-role-key>`,
		apikey: '<your-service-role-key>'
	},
	body: JSON.stringify({
		topic: 'room:lobby:messages',
		event: 'message_sent',
		payload: {
			text: 'Hello from server!',
			user: 'system',
			timestamp: new Date().toISOString()
		},
		private: true
	})
});
```

#### 5.3 using database triggers

Automatically broadcast database changes using triggers. Choose the approach that best fits your needs:

**Using `realtime.broadcast_changes` (Best for mirroring database changes)**

```sql
-- Create a trigger function for broadcasting database changes
CREATE OR REPLACE FUNCTION broadcast_message_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to room-specific channel
  PERFORM realtime.broadcast_changes(
    'room:' || NEW.room_id::text || ':messages',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to your messages table
CREATE TRIGGER messages_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION broadcast_message_changes();
```

**Using `realtime.send` (Best for custom notifications and filtered data)**

```sql
-- Create a trigger function for custom notifications
CREATE OR REPLACE FUNCTION notify_message_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Send custom notification when new message is created
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.send(
      'room:' || NEW.room_id::text || ':notifications',
      'message_created',
      jsonb_build_object(
        'message_id', NEW.id,
        'user_id', NEW.user_id,
        'room_id', NEW.room_id,
        'created_at', NEW.created_at
      ),
      true  -- private channel
    );
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to your messages table
CREATE TRIGGER messages_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_message_activity();
```

- **`realtime.broadcast_changes`** sends the full database change with metadata
- **`realtime.send`** allows you to send custom payloads and control exactly what data is broadcast

## Essential best practices

### Use private channels

Always use private channels for production applications to ensure proper security and authorization:

```ts
const channel = supabase.channel('room:123:messages', {
	config: { private: true }
});
```

### Follow naming conventions

**Channel Topics:** Use the pattern `scope:id:entity`

- `room:123:messages` - Messages in room 123
- `game:456:moves` - Game moves for game 456
- `user:789:notifications` - Notifications for user 789

### Clean up subscriptions

Always unsubscribe when you are done with a channel to ensure you free up resources:

```ts
// React example
import { useEffect } from 'react';

useEffect(() => {
	const channel = supabase.channel('room:123:messages');

	return () => {
		supabase.removeChannel(channel);
	};
}, []);
```

## Choose the right feature

### When to use Broadcast

- Real-time messaging and notifications
- Custom events and game state
- Database change notifications (with triggers)
- High-frequency updates (e.g. Cursor tracking)
- Most use cases

### When to use Presence

- User online/offline status
- Active user counters
- Use minimally due to computational overhead

### When to use Postgres Changes

- Quick testing and development
- Low amount of connected users

## Next steps

Now that you understand the basics, dive deeper into each feature:

### Core features

- **[Broadcast](/docs/guides/realtime/broadcast)** - Learn about sending messages, database triggers, and REST API usage
- **[Presence](/docs/guides/realtime/presence)** - Implement user state tracking and online indicators
- **[Postgres Changes](/docs/guides/realtime/postgres-changes)** - Understanding database change listeners (consider migrating to Broadcast)

### Security & configuration

- **[Authorization](/docs/guides/realtime/authorization)** - Set up RLS policies for private channels
- **[Settings](/docs/guides/realtime/settings)** - Configure your Realtime instance for optimal performance

### Advanced topics

- **[Architecture](/docs/guides/realtime/architecture)** - Understand how Realtime works under the hood
- **[Benchmarks](/docs/guides/realtime/benchmarks)** - Performance characteristics and scaling considerations
- **[Quotas](/docs/guides/realtime/quotas)** - Usage limits and best practices

Ready to build something amazing? Start with the [Broadcast guide](/docs/guides/realtime/broadcast) to create your first real-time feature!
