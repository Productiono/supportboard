<script>
  import { cn } from '$lib/utils';
</script>

<div class={cn('flex items-center p-6 pt-0', $$restProps.class)} {...$$restProps}>
  <slot />
</div>
