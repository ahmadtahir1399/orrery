/**
 * Shared outbound email helper.
 *
 * Provider resolution (see `resolveEmailDelivery`):
 *   1. Resend — when `RESEND_API_KEY` is set and `EMAIL_PROVIDER` is not `smtp`.
 *      In `auto` mode a failed Resend send falls back to SMTP when SMTP is
 *      configured; `EMAIL_PROVIDER=resend` never switches transports silently.
 *   2. SMTP — DB-stored config (Admin → System → SMTP), then environment
 *      variables (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD,
 *      EMAIL_FROM).
 *
 * When nothing is configured we silently no-op so local/CI runs behave like a
 * "soft success" (useful so invite/signup flows don't fail just because email
 * isn't wired up).
 */

import {
  isResendConfigured,
  readEmailProviderPreference,
  resolveResendSender,
  RESEND_SANDBOX_FROM,
  sendWithResend,
} from '@tasknebula/db';
import { resolveSmtpConfig, type ResolvedSmtpConfig } from '@/lib/admin/system-settings';

export type EmailProvider = 'resend' | 'smtp';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Short machine label (e.g. `password_reset`) used for Resend analytics tags. */
  category?: string;
  /** Stable key for deduplicating a logical send across retries/processes. */
  idempotencyKey?: string;
}

export interface SendEmailResult {
  sent: boolean;
  messageId?: string;
  skipped?: boolean;
  error?: string;
  provider?: EmailProvider;
}

export type EmailDelivery =
  | { provider: 'resend'; from: string; sandboxSender: boolean; smtpFallback: boolean }
  | { provider: 'smtp'; source: ResolvedSmtpConfig['source']; from: string }
  | { provider: 'none'; misconfigured: boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Transport = { sendMail: (opts: any) => Promise<{ messageId?: string }> };

type CachedTransport = {
  transport: Transport;
  signature: string;
  emailFrom: string;
};

let cachedTransport: CachedTransport | null = null;

function signatureFor(cfg: ResolvedSmtpConfig) {
  return [
    cfg.source,
    cfg.host,
    cfg.port,
    cfg.secure ? '1' : '0',
    cfg.user,
    // hash-like shortener — avoids holding the raw password in memory as a
    // cache key. Length + last4 is enough to detect rotation.
    `${cfg.password.length}:${cfg.password.slice(-4)}`,
  ].join('|');
}

async function buildTransport(cfg: ResolvedSmtpConfig): Promise<Transport> {
  const nodemailer = await import('nodemailer');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transportOptions: Record<string, any> = {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    tls: { rejectUnauthorized: false },
  };

  if (cfg.user && cfg.password) {
    transportOptions.auth = { user: cfg.user, pass: cfg.password };
  }

  return nodemailer.default.createTransport(transportOptions) as Transport;
}

async function getTransport(): Promise<{ transport: Transport; emailFrom: string } | null> {
  const cfg = await resolveSmtpConfig();
  if (!cfg) return null;

  const signature = signatureFor(cfg);
  if (cachedTransport && cachedTransport.signature === signature) {
    return { transport: cachedTransport.transport, emailFrom: cachedTransport.emailFrom };
  }

  const transport = await buildTransport(cfg);
  cachedTransport = { transport, signature, emailFrom: cfg.emailFrom };
  return { transport, emailFrom: cfg.emailFrom };
}

/**
 * Describe which transport will carry outbound email right now, without
 * exposing credentials. Used by the admin panel and the test-email endpoint.
 */
export async function resolveEmailDelivery(): Promise<EmailDelivery> {
  const preference = readEmailProviderPreference();

  if (isResendConfigured()) {
    const from = resolveResendSender();
    const smtp = preference === 'resend' ? null : await resolveSmtpConfig();
    return {
      provider: 'resend',
      from,
      sandboxSender: from === RESEND_SANDBOX_FROM,
      smtpFallback: Boolean(smtp),
    };
  }

  // `EMAIL_PROVIDER=resend` without a key is a misconfiguration, not SMTP.
  if (preference === 'resend') return { provider: 'none', misconfigured: true };

  const smtp = await resolveSmtpConfig();
  if (smtp) return { provider: 'smtp', source: smtp.source, from: smtp.emailFrom };
  return { provider: 'none', misconfigured: false };
}

async function sendViaSmtp(params: SendEmailParams): Promise<SendEmailResult> {
  const resolved = await getTransport();
  if (!resolved) {
    return { sent: false, skipped: true };
  }

  const info = await resolved.transport.sendMail({
    from: resolved.emailFrom,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  // QUAL-21: under exactOptionalPropertyTypes, `messageId?: string` cannot
  // accept `string | undefined`. nodemailer types `messageId` as optional,
  // so spread it only when present.
  return {
    sent: true,
    provider: 'smtp',
    ...(info.messageId !== undefined ? { messageId: info.messageId } : {}),
  };
}

/**
 * Send a raw email. Returns `{ sent: false, skipped: true }` when no email
 * transport is configured so callers can treat that as a soft success.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const preference = readEmailProviderPreference();

    if (isResendConfigured()) {
      const result = await sendWithResend({
        to: params.to,
        subject: params.subject,
        html: params.html,
        ...(params.text ? { text: params.text } : {}),
        ...(params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : {}),
        tags: [
          { name: 'app', value: 'tasknebula' },
          ...(params.category ? [{ name: 'category', value: params.category }] : []),
        ],
      });

      if (result.ok) {
        return { sent: true, provider: 'resend', ...(result.id ? { messageId: result.id } : {}) };
      }

      console.error('[email/sender] Resend delivery failed:', result.error);
      if (preference === 'resend') {
        return { sent: false, provider: 'resend', error: result.error };
      }

      const fallback = await sendViaSmtp(params);
      if (fallback.skipped) {
        return { sent: false, provider: 'resend', error: result.error };
      }
      console.warn('[email/sender] delivered through SMTP fallback after Resend failure');
      return fallback;
    }

    if (preference === 'resend') {
      console.error('[email/sender] EMAIL_PROVIDER=resend but RESEND_API_KEY is not set');
      return { sent: false, provider: 'resend', error: 'RESEND_API_KEY is not configured' };
    }

    return await sendViaSmtp(params);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[email/sender] failed to send email:', message);
    return { sent: false, error: message };
  }
}

/**
 * Reset the cached transporter — useful after an admin rotates the SMTP
 * password so the next send picks up fresh credentials without a server
 * restart.
 */
export function resetEmailTransportCache() {
  cachedTransport = null;
}
