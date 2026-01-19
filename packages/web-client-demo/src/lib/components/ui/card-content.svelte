<script>
  import { cn } from '$lib/utils';
</script>

<div class={cn('p-6 pt-0', $$restProps.class)} {...$$restProps}>
  <slot />
</div>
