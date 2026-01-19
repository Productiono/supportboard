<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/authClient';
  import { accessToken } from '$lib/stores/auth';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardFooter from '$lib/components/ui/card-footer.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';

  let email = '';
  let password = '';
  let errorMessage = '';
  let isSubmitting = false;

  async function handleSubmit() {
    errorMessage = '';
    isSubmitting = true;
    try {
      const token = await login(email, password);
      accessToken.set(token);
      await goto('/dashboard');
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to login';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
  <div class="hidden flex-col justify-between bg-muted p-10 text-foreground lg:flex">
    <div class="text-lg font-semibold">Mattercall</div>
    <div class="space-y-4">
      <p class="text-3xl font-semibold">Welcome back.</p>
      <p class="text-sm text-muted-foreground">
        Sign in to continue managing your calls, dashboards, and integrations.
      </p>
    </div>
    <p class="text-sm text-muted-foreground">Need an account? Register in seconds.</p>
  </div>

  <div class="flex items-center justify-center p-6">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your email and password to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" bind:value={email} placeholder="you@mattercall.com" />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" bind:value={password} />
          </div>
          {#if errorMessage}
            <p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          {/if}
          <Button type="submit" class="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex-col gap-2 text-sm text-muted-foreground">
        <span>
          New here?
          <a class="font-medium text-foreground hover:underline" href="/register">Create an account</a>
        </span>
      </CardFooter>
    </Card>
  </div>
</div>
