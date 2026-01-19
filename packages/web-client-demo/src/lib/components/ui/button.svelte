<script>
  import { cn } from '$lib/utils';
</script>

<button
  class={cn(
    'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    $$restProps.class
  )}
  {...$$restProps}
>
  <slot />
</button>
