import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, hashed: string) {
  const [saltHex, hashHex] = hashed.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  if (expectedHash.length !== derivedKey.length) return false;

  return timingSafeEqual(expectedHash, derivedKey);
}
