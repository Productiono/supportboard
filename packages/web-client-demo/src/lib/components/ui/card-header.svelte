<script>
  import { cn } from '$lib/utils';
</script>

<div class={cn('flex flex-col space-y-1.5 p-6', $$restProps.class)} {...$$restProps}>
  <slot />
</div>
