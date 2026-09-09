import 'server-only';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Secret Type Interfaces ────────────────────────────────────────────────────

export interface GoogleOAuthSecret {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  account_email: string;
}

export interface MicrosoftOAuthSecret {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  account_email: string;
}

export interface TodoistSecret {
  access_token: string;
  account_email?: string;
}

export interface NotionSecret {
  access_token: string;
  workspace_id: string;
  workspace_name?: string;
}

export interface ImapAccountSecret {
  id: string;
  email: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  password: string;
}

export interface ApiKeysSecret {
  gemini?: string;
}

// ─── Key Derivation ────────────────────────────────────────────────────────────

const PCC_DIR = path.join(os.homedir(), '.pcc');
const SECRETS_DIR = process.env.PCC_SECRETS_PATH ?? path.join(PCC_DIR, 'secrets');
const MACHINE_KEY_PATH = path.join(PCC_DIR, 'machine.key');

fs.mkdirSync(SECRETS_DIR, { recursive: true });

function getMachineKey(): Buffer {
  if (!fs.existsSync(MACHINE_KEY_PATH)) {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(MACHINE_KEY_PATH, key.toString('hex'), { mode: 0o600 });
    return key;
  }
  return Buffer.from(fs.readFileSync(MACHINE_KEY_PATH, 'utf8').trim(), 'hex');
}

function deriveKey(): Buffer {
  const machineKey = getMachineKey();
  const salt = os.hostname();
  return crypto.pbkdf2Sync(machineKey, salt, 100_000, 32, 'sha256');
}

const ENCRYPTION_KEY = deriveKey();

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload: EncryptedPayload = {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  };
  return JSON.stringify(payload);
}

function decrypt(ciphertext: string): string {
  const { iv, tag, data } = JSON.parse(ciphertext) as EncryptedPayload;
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  return decipher.update(Buffer.from(data, 'hex')).toString('utf8') + decipher.final('utf8');
}

// ─── Public API ───────────────────────────────────────────────────────────────

function secretPath(name: string): string {
  return path.join(SECRETS_DIR, `${name}.enc`);
}

export function readSecret<T>(name: string): T | null {
  const filePath = secretPath(name);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(decrypt(fs.readFileSync(filePath, 'utf8'))) as T;
  } catch {
    return null;
  }
}

export function writeSecret<T extends object>(name: string, data: T): void {
  fs.writeFileSync(secretPath(name), encrypt(JSON.stringify(data)), { encoding: 'utf8', mode: 0o600 });
}

export function deleteSecret(name: string): void {
  const filePath = secretPath(name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
