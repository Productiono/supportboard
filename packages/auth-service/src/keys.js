import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, '..', 'keys');
const privatePath = path.join(keysDir, 'private.pem');
const publicPath = path.join(keysDir, 'public.pem');

export async function loadOrCreateKeys() {
  if (process.env.PRIVATE_KEY && process.env.PUBLIC_KEY) {
    return { privateKey: process.env.PRIVATE_KEY, publicKey: process.env.PUBLIC_KEY };
  }
  try {
    const [privateKey, publicKey] = await Promise.all([
      fs.readFile(privatePath, 'utf8'),
      fs.readFile(publicPath, 'utf8')
    ]);
    return { privateKey, publicKey };
  } catch (error) {
    await fs.mkdir(keysDir, { recursive: true });
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const privatePem = await exportPKCS8(privateKey);
    const publicPem = await exportSPKI(publicKey);
    await Promise.all([
      fs.writeFile(privatePath, privatePem, 'utf8'),
      fs.writeFile(publicPath, publicPem, 'utf8')
    ]);
    return { privateKey: privatePem, publicKey: publicPem };
  }
}
