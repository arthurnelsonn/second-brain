import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SECRETS_DIR = process.env.SECRETS_PATH ?? path.join(os.homedir(), '.pcc', 'secrets');
const KEY_SOURCE = process.env.ENCRYPTION_KEY ?? os.hostname();
const KEY = crypto.createHash('sha256').update(KEY_SOURCE).digest();

fs.mkdirSync(SECRETS_DIR, { recursive: true });

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({ iv: iv.toString('hex'), tag: tag.toString('hex'), data: encrypted.toString('hex') });
}

function decrypt(ciphertext: string): string {
  const { iv, tag, data } = JSON.parse(ciphertext);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  return decipher.update(Buffer.from(data, 'hex')) + decipher.final('utf8');
}

export function readSecret<T>(filename: string): T | null {
  const filePath = path.join(SECRETS_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(decrypt(fs.readFileSync(filePath, 'utf8'))) as T;
}

export function writeSecret<T>(filename: string, data: T): void {
  fs.writeFileSync(path.join(SECRETS_DIR, filename), encrypt(JSON.stringify(data)), 'utf8');
}
