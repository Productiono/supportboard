<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { logout } from '$lib/authClient';
  import { accessToken } from '$lib/stores/auth';
  import Button from '$lib/components/ui/button.svelte';

  export let data: {
    health: { ok: boolean } | null;
    status: number;
    accessToken: string | null;
  };

  let isLoggingOut = false;

  onMount(() => {
    if (data.accessToken) {
      accessToken.set(data.accessToken);
    }
  });

  async function handleLogout() {
    isLoggingOut = true;
    try {
      await logout();
      accessToken.set(null);
      await goto('/login');
    } finally {
      isLoggingOut = false;
    }
  }
</script>

<main class="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
  <header class="flex flex-col gap-2">
    <h1 class="text-3xl font-semibold">Dashboard</h1>
    <p class="text-sm text-muted-foreground">
      This page is protected by the refresh-token hook and calls the API health endpoint.
    </p>
  </header>

  <section class="rounded-lg border border-border bg-card p-6 shadow-sm">
    <h2 class="text-lg font-medium">API Health</h2>
    <p class="mt-2 text-sm text-muted-foreground">
      Response status: {data.status}
    </p>
    <pre class="mt-4 rounded-md bg-muted p-4 text-sm text-foreground">
{JSON.stringify(data.health, null, 2)}
    </pre>
  </section>

  <div class="flex flex-wrap gap-3">
    <Button type="button" on:click={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Signing out…' : 'Sign out'}
    </Button>
    <a
      class="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
      href="/"
    >
      Back to home
    </a>
  </div>
</main>
