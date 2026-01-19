import { redirect } from '@sveltejs/kit';

const AUTH_BASE_URL = 'https://log.mattercall.com/auth';
const APP_ORIGIN = 'https://auth.mattercall.com';
const PROTECTED_ROUTES = ['/dashboard'];

export async function handle({ event, resolve }) {
  if (PROTECTED_ROUTES.some((route) => event.url.pathname.startsWith(route))) {
    const cookie = event.request.headers.get('cookie') ?? '';
    const response = await event.fetch(`${AUTH_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        cookie,
        origin: APP_ORIGIN
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw redirect(303, '/login');
    }

    const data = await response.json();
    event.locals.accessToken = data.accessToken;
  }

  return resolve(event);
}
