<script>
  import { cn } from '$lib/utils';
</script>

<div
  class={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', $$restProps.class)}
  {...$$restProps}
>
  <slot />
</div>
