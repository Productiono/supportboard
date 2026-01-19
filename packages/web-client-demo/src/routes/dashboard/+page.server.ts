export async function load({ locals, fetch }) {
  const headers: Record<string, string> = {};
  if (locals.accessToken) {
    headers.Authorization = `Bearer ${locals.accessToken}`;
  }

  const response = await fetch('https://log.mattercall.com/api/health', {
    headers
  });

  const health = response.ok ? await response.json() : null;

  return {
    health,
    status: response.status,
    accessToken: locals.accessToken ?? null
  };
}
