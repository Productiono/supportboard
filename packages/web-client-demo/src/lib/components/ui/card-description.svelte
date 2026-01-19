<script>
  import { cn } from '$lib/utils';
</script>

<p class={cn('text-sm text-muted-foreground', $$restProps.class)} {...$$restProps}>
  <slot />
</p>
