<script lang="ts">
	// Predefined aesthetically pleasing gradient combinations
	const gradients = [
		'bg-gradient-to-br from-blue-400 to-purple-500',
		'bg-gradient-to-tr from-green-400 to-blue-500',
		'bg-gradient-to-br from-purple-400 to-pink-500',
		'bg-gradient-to-tr from-yellow-400 to-red-500',
		'bg-gradient-to-br from-indigo-400 to-blue-500',
		'bg-gradient-to-tr from-pink-400 to-purple-500',
		'bg-gradient-to-br from-teal-400 to-blue-500',
		'bg-gradient-to-tr from-orange-400 to-red-500',
		'bg-gradient-to-br from-cyan-400 to-blue-500',
		'bg-gradient-to-tr from-lime-400 to-green-500'
	];

	// Select a random gradient
	const selectedGradient = $state(gradients[Math.floor(Math.random() * gradients.length)]);
</script>

<!-- Gradient placeholder with same dimensions as post cover -->
<div class="{selectedGradient} h-48 w-full rounded-lg sm:h-64"></div>
