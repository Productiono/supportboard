<script>
  import { cn } from '$lib/utils';
</script>

<h3 class={cn('text-2xl font-semibold leading-none tracking-tight', $$restProps.class)} {...$$restProps}>
  <slot />
</h3>
