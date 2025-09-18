<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AvatarUpload from '$lib/components/modules/user/AvatarUpload.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { LogOut, User, Shield } from '@lucide/svelte';

	const { data: propsData } = $props();
	const { userProfile, session, supabase } = propsData;
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<User class="h-5 w-5" />
				Profile Picture
			</CardTitle>
			<CardDescription>Update your profile picture</CardDescription>
		</CardHeader>
		<CardContent>
			<AvatarUpload
				{supabase}
				userId={session.user.id}
				username={userProfile.username}
				currentAvatarUrl={userProfile.avatar_url}
				on:avatarUpdated={() => invalidate('app:user')}
			/>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Profile Information</CardTitle>
			<CardDescription>Your account details</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">Username</p>
					<p class="text-sm text-muted-foreground">{userProfile.username}</p>
				</div>
			</div>
			<Separator />
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">Email</p>
					<p class="text-sm text-muted-foreground">{session.user.email}</p>
				</div>
			</div>
			<div class="pt-4">
				<p class="text-sm text-muted-foreground">Profile editing functionality coming soon...</p>
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Shield class="h-5 w-5" />
				Account Security
			</CardTitle>
			<CardDescription>Manage your account security settings</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex flex-col gap-3">
				<Button variant="outline" onclick={() => (window.location.href = '/auth/logout')}>
					<LogOut class="mr-2 h-4 w-4" />
					Logout
				</Button>
				<Button variant="destructive" disabled>
					<Shield class="mr-2 h-4 w-4" />
					Delete Account
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
