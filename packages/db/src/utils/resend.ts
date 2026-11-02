/**
 * Resend transactional email client (https://resend.com/docs/api-reference/emails/send-email).
 *
 * A dependency-free HTTP client shared by every email path in the monorepo:
 * the web app's raw sender (auth, invites, notifications) and the template
 * email service in this package. Keeping one implementation means retries,
 * timeouts, idempotency, and error redaction behave identically everywhere.
 *
 * Configuration (environment):
 *   RESEND_API_KEY   — API key (`re_…`). Presence enables Resend.
 *   EMAIL_FROM       — Sender, e.g. `TaskNebula <notifications@your-domain.com>`.
 *                      The domain must be verified in Resend. Without it, the
 *                      Resend sandbox sender is used, which can only deliver to
 *                      the Resend account owner's address.
 *   EMAIL_REPLY_TO   — Optional default Reply-To address.
 *   EMAIL_PROVIDER   — `auto` (default), `resend`, or `smtp`. `smtp` ignores a
 *                      configured Resend key; `auto` prefers Resend when a key exists.
 */

export const RESEND_API_URL = 'https://api.resend.com/emails';
export const RESEND_SANDBOX_FROM = 'Orrery <onboarding@resend.dev>';

export type EmailProviderPreference = 'auto' | 'resend' | 'smtp';

export interface ResendEmailTag {
  name: string;
  value: string;
}

export interface ResendEmailInput {
  to: string | string[];
  subject: string;
  /** At least one of `html` or `text` is required. */
  html?: string;
  text?: string;
  /** Overrides the configured sender. */
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  tags?: ResendEmailTag[];
  headers?: Record<string, string>;
  /**
   * Resend deduplicates the same key for 24h. Supply a stable key (e.g. an
   * event id) to make repeated sends across processes safe; otherwise one is
   * generated per call and reused for that call's retries.
   */
  idempotencyKey?: string;
}

export type ResendSendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status?: number; retryable: boolean };

export interface ResendClientOptions {
  apiKey?: string;
  from?: string;
  replyTo?: string;
  fetchImpl?: typeof fetch;
  /** Total attempts including the first one. */
  maxAttempts?: number;
  timeoutMs?: number;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRY_DELAY_MS = 5_000;
const TAG_PATTERN = /[^A-Za-z0-9_-]/g;

export function readEmailProviderPreference(
  env: NodeJS.ProcessEnv = process.env
): EmailProviderPreference {
  const value = env.EMAIL_PROVIDER?.trim().toLowerCase();
  return value === 'resend' || value === 'smtp' ? value : 'auto';
}

/** True when Resend should handle outbound email for this environment. */
export function isResendConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  if (readEmailProviderPreference(env) === 'smtp') return false;
  return Boolean(env.RESEND_API_KEY?.trim());
}

export function resolveResendSender(env: NodeJS.ProcessEnv = process.env): string {
  return env.EMAIL_FROM?.trim() || RESEND_SANDBOX_FROM;
}

/** Resend tag names/values allow ASCII letters, numbers, `_` and `-` (≤256 chars). */
export function sanitizeResendTags(tags: ResendEmailTag[] | undefined): ResendEmailTag[] {
  if (!tags) return [];
  return tags
    .map((tag) => ({
      name: tag.name.replace(TAG_PATTERN, '_').slice(0, 256),
      value: tag.value.replace(TAG_PATTERN, '_').slice(0, 256),
    }))
    .filter((tag) => tag.name.length > 0 && tag.value.length > 0);
}

function toList(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  const list = (Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean);
  return list.length > 0 ? list : undefined;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function retryDelayMs(attempt: number, retryAfterHeader: string | null): number {
  const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY_MS);
  }
  // 250ms, 750ms, 2250ms … capped.
  return Math.min(250 * 3 ** (attempt - 1), MAX_RETRY_DELAY_MS);
}

/** Never echo an API key back into logs or API responses. */
function redact(message: string, apiKey: string): string {
  const withoutKey = apiKey ? message.split(apiKey).join('[redacted]') : message;
  return withoutKey.replace(/re_[A-Za-z0-9_]{8,}/g, 're_[redacted]').slice(0, 500);
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown; name?: unknown };
    const parts = [body.name, body.message].filter(
      (part): part is string => typeof part === 'string' && part.length > 0
    );
    if (parts.length > 0) return parts.join(': ');
  } catch {
    // Non-JSON error body — fall through to the status line.
  }
  return `Resend responded with HTTP ${response.status}`;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function sendWithResend(
  input: ResendEmailInput,
  options: ResendClientOptions = {}
): Promise<ResendSendResult> {
  const apiKey = (options.apiKey ?? process.env.RESEND_API_KEY ?? '').trim();
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not configured', retryable: false };
  }

  const to = toList(input.to);
  if (!to) {
    return { ok: false, error: 'Email recipient is required', retryable: false };
  }

  if (!input.html && !input.text) {
    return { ok: false, error: 'Email body (html or text) is required', retryable: false };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const maxAttempts = Math.max(1, options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const replyTo = toList(input.replyTo ?? options.replyTo ?? process.env.EMAIL_REPLY_TO);
  const tags = sanitizeResendTags(input.tags);

  const payload: Record<string, unknown> = {
    from: input.from?.trim() || options.from?.trim() || resolveResendSender(),
    to,
    subject: input.subject,
  };
  if (input.html) payload.html = input.html;
  if (input.text) payload.text = input.text;
  if (replyTo) payload.reply_to = replyTo;
  const cc = toList(input.cc);
  if (cc) payload.cc = cc;
  const bcc = toList(input.bcc);
  if (bcc) payload.bcc = bcc;
  if (tags.length > 0) payload.tags = tags;
  if (input.headers && Object.keys(input.headers).length > 0) payload.headers = input.headers;

  // A timed-out request may still have been accepted, so every logical send
  // carries one idempotency key reused across retries: a retry can never
  // deliver the same message twice.
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'tasknebula-email/1.0',
    'Idempotency-Key': (input.idempotencyKey || globalThis.crypto.randomUUID()).slice(0, 256),
  };

  let lastFailure: ResendSendResult = {
    ok: false,
    error: 'Resend request was not attempted',
    retryable: true,
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let retryAfter: string | null = null;

    try {
      const response = await fetchImpl(RESEND_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (response.ok) {
        const body = (await response.json().catch(() => ({}))) as { id?: unknown };
        return { ok: true, id: typeof body.id === 'string' ? body.id : '' };
      }

      retryAfter = response.headers.get('retry-after');
      lastFailure = {
        ok: false,
        status: response.status,
        error: redact(await readErrorMessage(response), apiKey),
        retryable: isRetryableStatus(response.status),
      };
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      const message = aborted
        ? `Resend request timed out after ${timeoutMs}ms`
        : error instanceof Error
          ? error.message
          : String(error);
      lastFailure = { ok: false, error: redact(message, apiKey), retryable: true };
    } finally {
      clearTimeout(timer);
    }

    if (!lastFailure.retryable || attempt === maxAttempts) break;
    await sleep(retryDelayMs(attempt, retryAfter));
  }

  return lastFailure;
}
