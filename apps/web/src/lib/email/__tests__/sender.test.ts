/** @jest-environment node */

const resolveSmtpConfigMock = jest.fn();
const sendMailMock = jest.fn();
const sendWithResendMock = jest.fn();

jest.mock('@/lib/admin/system-settings', () => ({
  resolveSmtpConfig: (...args: unknown[]) => resolveSmtpConfigMock(...args),
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: (...args: unknown[]) => sendMailMock(...args),
    })),
  },
}));

jest.mock('@tasknebula/db', () => {
  const actual = jest.requireActual('@tasknebula/db/src/utils/resend');
  return {
    ...actual,
    sendWithResend: (...args: unknown[]) => sendWithResendMock(...args),
  };
});

import { resetEmailTransportCache, resolveEmailDelivery, sendEmail } from '../sender';

const ORIGINAL_ENV = { ...process.env };
const SMTP_CONFIG = {
  source: 'env',
  host: 'smtp.clinic.test',
  port: 587,
  secure: false,
  user: 'mailer',
  password: 'secret',
  emailFrom: 'Clinic <smtp@clinic.test>',
};
const message = {
  to: 'patient@clinic.test',
  subject: 'Reset your password',
  html: '<p>Reset</p>',
  text: 'Reset',
  category: 'password_reset',
};

describe('email sender provider selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetEmailTransportCache();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_PROVIDER;
    delete process.env.EMAIL_FROM;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    resolveSmtpConfigMock.mockResolvedValue(null);
    sendMailMock.mockResolvedValue({ messageId: 'smtp-1' });
    sendWithResendMock.mockResolvedValue({ ok: true, id: 'resend-1' });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('soft-skips when no provider is configured', async () => {
    await expect(sendEmail(message)).resolves.toEqual({ sent: false, skipped: true });
    await expect(resolveEmailDelivery()).resolves.toEqual({
      provider: 'none',
      misconfigured: false,
    });
  });

  it('delivers through Resend with category tags when a key is set', async () => {
    process.env.RESEND_API_KEY = 're_test_abcdefghij';
    process.env.EMAIL_FROM = 'Clinic <care@clinic.test>';

    await expect(sendEmail(message)).resolves.toEqual({
      sent: true,
      provider: 'resend',
      messageId: 'resend-1',
    });
    expect(sendWithResendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'patient@clinic.test',
        tags: [
          { name: 'app', value: 'tasknebula' },
          { name: 'category', value: 'password_reset' },
        ],
      })
    );
    expect(sendMailMock).not.toHaveBeenCalled();
    await expect(resolveEmailDelivery()).resolves.toEqual({
      provider: 'resend',
      from: 'Clinic <care@clinic.test>',
      sandboxSender: false,
      smtpFallback: false,
    });
  });

  it('falls back to SMTP in auto mode when Resend fails', async () => {
    process.env.RESEND_API_KEY = 're_test_abcdefghij';
    resolveSmtpConfigMock.mockResolvedValue(SMTP_CONFIG);
    sendWithResendMock.mockResolvedValue({ ok: false, error: 'Unavailable', retryable: true });

    await expect(sendEmail(message)).resolves.toEqual({
      sent: true,
      provider: 'smtp',
      messageId: 'smtp-1',
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'Clinic <smtp@clinic.test>', to: 'patient@clinic.test' })
    );
  });

  it('never switches transports when EMAIL_PROVIDER=resend', async () => {
    process.env.RESEND_API_KEY = 're_test_abcdefghij';
    process.env.EMAIL_PROVIDER = 'resend';
    resolveSmtpConfigMock.mockResolvedValue(SMTP_CONFIG);
    sendWithResendMock.mockResolvedValue({ ok: false, error: 'Forbidden', retryable: false });

    await expect(sendEmail(message)).resolves.toEqual({
      sent: false,
      provider: 'resend',
      error: 'Forbidden',
    });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('reports EMAIL_PROVIDER=resend without a key as misconfigured', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    resolveSmtpConfigMock.mockResolvedValue(SMTP_CONFIG);

    await expect(sendEmail(message)).resolves.toMatchObject({ sent: false, provider: 'resend' });
    await expect(resolveEmailDelivery()).resolves.toEqual({
      provider: 'none',
      misconfigured: true,
    });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('uses SMTP when EMAIL_PROVIDER=smtp even with a Resend key', async () => {
    process.env.RESEND_API_KEY = 're_test_abcdefghij';
    process.env.EMAIL_PROVIDER = 'smtp';
    resolveSmtpConfigMock.mockResolvedValue(SMTP_CONFIG);

    await expect(sendEmail(message)).resolves.toEqual({
      sent: true,
      provider: 'smtp',
      messageId: 'smtp-1',
    });
    expect(sendWithResendMock).not.toHaveBeenCalled();
    await expect(resolveEmailDelivery()).resolves.toEqual({
      provider: 'smtp',
      source: 'env',
      from: 'Clinic <smtp@clinic.test>',
    });
  });
});
