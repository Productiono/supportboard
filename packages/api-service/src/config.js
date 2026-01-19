import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  issuer: process.env.ISSUER || 'https://auth.example.com',
  audience: process.env.AUDIENCE || 'your-apis',
  jwksUrl: process.env.JWKS_URL || 'https://auth.example.com/jwks.json'
};
