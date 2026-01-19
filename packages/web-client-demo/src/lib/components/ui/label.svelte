<script>
  import { cn } from '$lib/utils';
</script>

<label
  class={cn('text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70', $$restProps.class)}
  {...$$restProps}
>
  <slot />
</label>
