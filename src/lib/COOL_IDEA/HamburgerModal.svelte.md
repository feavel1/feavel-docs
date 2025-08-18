<script lang="ts">

	import { fade } from 'svelte/transition';

	let width: string | number = 40;
</script>

<div>
	<svg
		role="none"
		onclick={modalProp.open}
		viewBox="0 0 100 100"
		fill="none"
		stroke="currentColor"
		stroke-width="3"
		{width}
	>
		<path
			class="bottom"
			d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
		/>
		<path class="middle" d="m 30,50 h 40" />
		<path
			class="top"
			d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
		/>
	</svg>

    {#if $modalProp}
    	<div
    		class="fixed top-0 right-0 bottom-0 left-0 bg-neutral-800/80"
    		in:fade={{ delay: 0, duration: 1000 }}
    		out:fade={{ delay: 0, duration: 200 }}
    	></div>

    	<div
    		role="none"
    		onclick={modalProp.close}
    		in:fade={{ delay: 0, duration: 1000 }}
    		out:fade={{ delay: 0, duration: 200 }}
    		class="fixed top-0 right-0 bottom-0 left-0 h-screen w-full self-center object-cover object-center"
    	>
    		<Navigation />
    	</div>
    {/if}

</div>
