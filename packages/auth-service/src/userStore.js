const users = [
  {
    id: 'user-1',
    email: 'user@example.com',
    password: 'password123',
    roles: ['user']
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    password: 'adminpass',
    roles: ['admin', 'user']
  }
];

export async function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

export async function findUserById(id) {
  return users.find((user) => user.id === id) || null;
}

export async function validateUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}
