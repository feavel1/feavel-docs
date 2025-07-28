# Supabase Storage Implementation

This project includes a comprehensive Supabase storage implementation for file uploads, downloads, and avatar management.

## Features

### 1. Storage Utilities (`src/lib/utils/supabase.ts`)

- **`uploadFile()`** - Upload files to Supabase storage
- **`downloadFile()`** - Download files from storage
- **`deleteFile()`** - Delete files from storage
- **`getFileUrl()`** - Get public URLs for files
- **`uploadAvatar()`** - Upload user avatars
- **`deleteAvatar()`** - Delete user avatars
- **`getAvatarUrl()`** - Get avatar URLs
- **`updateUserAvatar()`** - Update avatar URL in database
- **`uploadUserAvatar()`** - Complete avatar upload process

### 2. Avatar Display (`src/lib/utils/user.ts`)

- **`getAvatarDisplayUrl()`** - Get avatar URL with fallback to default avatar
- Uses DiceBear API for default avatars when no custom avatar is set

### 3. Avatar Upload Component (`src/lib/components/modules/AvatarUpload.svelte`)

- Drag and drop file upload
- File type validation (images only)
- File size validation (max 5MB)
- Preview functionality
- Progress indicators
- Error handling

## Usage

### Basic File Operations

```typescript
import { uploadFile, downloadFile, deleteFile, getFileUrl } from '$lib/utils/supabase';

// Upload a file
const result = await uploadFile(supabase, {
	file: myFile,
	path: 'folder/filename.jpg',
	bucket: 'storage'
});

// Download a file
const blob = await downloadFile(supabase, {
	path: 'folder/filename.jpg',
	bucket: 'storage'
});

// Delete a file
const success = await deleteFile(supabase, {
	path: 'folder/filename.jpg',
	bucket: 'storage'
});

// Get public URL
const url = await getFileUrl(supabase, {
	path: 'folder/filename.jpg',
	bucket: 'storage'
});
```

### Avatar Management

```typescript
import { uploadUserAvatar, getAvatarDisplayUrl } from '$lib/utils/supabase';

// Upload user avatar
const result = await uploadUserAvatar(supabase, file, userId);

// Display avatar with fallback
const avatarUrl = getAvatarDisplayUrl(userProfile.avatar_url, userProfile.username);
```

### Using the Avatar Upload Component

```svelte
<script>
	import { AvatarUpload } from '$lib/components/modules';

	function handleUpload(event) {
		const { success, url, error } = event.detail;
		if (success) {
			console.log('Avatar updated:', url);
		} else {
			console.error('Upload failed:', error);
		}
	}
</script>

<AvatarUpload
	{supabase}
	userId={session.user.id}
	currentAvatarUrl={userProfile.avatar_url}
	username={userProfile.username}
	on:upload={handleUpload}
/>
```

## Database Schema

The `users` table includes an `avatar_url` field:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  birthday DATE,
  description TEXT
);
```

## Storage Bucket

The implementation uses a `storage` bucket in Supabase with the following structure:

```
storage/
├── {userId}/
│   └── avatar.{ext}  # User avatars
└── demo/
    └── {userId}/
        └── {filename}  # Demo files
```

## Security

- File uploads are restricted to authenticated users
- File types are validated on the client side
- File sizes are limited to prevent abuse
- Avatar uploads are scoped to user IDs

## Testing

Visit `/demo/storage` to test the storage functionality with a comprehensive demo interface.

## Integration Points

The storage functionality is integrated throughout the application:

1. **User Profiles** (`/member/[slug]`) - Display avatars
2. **Members List** (`/members`) - Show user avatars
3. **Settings** (`/member/[slug]/settings`) - Upload avatars
4. **Navigation** - Display user avatar in header

## Error Handling

All storage operations include comprehensive error handling:

- Network errors
- File validation errors
- Database update errors
- Storage quota exceeded errors

## Performance

- Files are cached with appropriate cache control headers
- Avatar URLs are generated efficiently
- Default avatars are served from external CDN (DiceBear)
- File uploads include progress indicators
