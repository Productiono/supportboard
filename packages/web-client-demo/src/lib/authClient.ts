const AUTH_BASE_URL = 'https://log.mattercall.com/auth';

type AuthResponse = {
  accessToken?: string;
  error?: string;
};

async function parseError(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = (await response.json()) as AuthResponse;
    return data.error ?? 'Request failed';
  }
  return response.statusText || 'Request failed';
}

async function requestJson(path: string, payload?: Record<string, unknown>) {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: payload ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as AuthResponse;
  }

  return {};
}

export async function login(email: string, password: string) {
  const data = await requestJson('/login', { email, password });
  if (data.accessToken) {
    return data.accessToken;
  }
  const refreshed = await refresh();
  return refreshed;
}

export async function register(email: string, password: string, name?: string) {
  const payload: Record<string, unknown> = { email, password };
  if (name) payload.name = name;
  const data = await requestJson('/register', payload);
  if (data.accessToken) {
    return data.accessToken;
  }
  const refreshed = await refresh();
  return refreshed;
}

export async function logout() {
  await requestJson('/logout');
}

export async function refresh() {
  const data = await requestJson('/refresh');
  if (!data.accessToken) {
    throw new Error('Missing access token');
  }
  return data.accessToken;
}
