<main class="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 p-6 text-center">
  <h1 class="text-4xl font-semibold">Mattercall Auth Demo</h1>
  <p class="max-w-xl text-muted-foreground">
    Use the login or registration flows to get a refresh cookie and access token, then visit the
    protected dashboard.
  </p>
  <div class="flex flex-wrap items-center justify-center gap-4">
    <a
      class="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
      href="/login"
    >
      Go to Login
    </a>
    <a
      class="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
      href="/register"
    >
      Create account
    </a>
    <a
      class="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
      href="/dashboard"
    >
      View Dashboard
    </a>
  </div>
</main>
