/** @jest-environment node */

import {
  isResendConfigured,
  readEmailProviderPreference,
  resolveResendSender,
  RESEND_API_URL,
  RESEND_SANDBOX_FROM,
  sanitizeResendTags,
  sendWithResend,
} from '@tasknebula/db/src/utils/resend';

type FetchCall = [string, RequestInit];

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => body,
  } as unknown as Response;
}

const baseInput = {
  to: 'patient.care@clinic.test',
  subject: 'Appointment reminder',
  html: '<p>Hello</p>',
};
const noSleep = jest.fn(async () => undefined);

describe('resend client configuration', () => {
  it('prefers Resend in auto mode only when a key exists', () => {
    expect(isResendConfigured({ RESEND_API_KEY: 're_live_123' })).toBe(true);
    expect(isResendConfigured({ RESEND_API_KEY: '   ' })).toBe(false);
    expect(isResendConfigured({})).toBe(false);
  });

  it('lets EMAIL_PROVIDER=smtp override a configured key', () => {
    expect(isResendConfigured({ RESEND_API_KEY: 're_live_123', EMAIL_PROVIDER: 'smtp' })).toBe(
      false
    );
    expect(readEmailProviderPreference({ EMAIL_PROVIDER: 'RESEND' })).toBe('resend');
    expect(readEmailProviderPreference({ EMAIL_PROVIDER: 'carrier-pigeon' })).toBe('auto');
  });

  it('falls back to the Resend sandbox sender without EMAIL_FROM', () => {
    expect(resolveResendSender({})).toBe(RESEND_SANDBOX_FROM);
    expect(resolveResendSender({ EMAIL_FROM: 'Care <care@clinic.test>' })).toBe(
      'Care <care@clinic.test>'
    );
  });

  it('sanitizes tags to the characters Resend accepts', () => {
    expect(
      sanitizeResendTags([
        { name: 'category', value: 'password reset!' },
        { name: '', value: 'dropped' },
      ])
    ).toEqual([{ name: 'category', value: 'password_reset_' }]);
  });
});

describe('sendWithResend', () => {
  beforeEach(() => {
    noSleep.mockClear();
  });

  it('posts the message and returns the Resend id', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(200, { id: 'email_123' }));

    const result = await sendWithResend(
      {
        ...baseInput,
        text: 'Hello',
        replyTo: 'front-desk@clinic.test',
        tags: [{ name: 'category', value: 'reminder' }],
      },
      { apiKey: 're_test_abcdefghij', from: 'Clinic <care@clinic.test>', fetchImpl }
    );

    expect(result).toEqual({ ok: true, id: 'email_123' });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as FetchCall;
    expect(url).toBe(RESEND_API_URL);
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer re_test_abcdefghij');
    expect(headers['Idempotency-Key']).toEqual(expect.any(String));
    expect(JSON.parse(String(init.body))).toEqual({
      from: 'Clinic <care@clinic.test>',
      to: ['patient.care@clinic.test'],
      subject: 'Appointment reminder',
      html: '<p>Hello</p>',
      text: 'Hello',
      reply_to: ['front-desk@clinic.test'],
      tags: [{ name: 'category', value: 'reminder' }],
    });
  });

  it('retries rate limits and server errors with one idempotency key', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(429, { message: 'Too many requests' }, { 'retry-after': '1' })
      )
      .mockResolvedValueOnce(jsonResponse(503, { message: 'Unavailable' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'email_after_retry' }));

    const result = await sendWithResend(baseInput, {
      apiKey: 're_test_abcdefghij',
      fetchImpl,
      sleep: noSleep,
    });

    expect(result).toEqual({ ok: true, id: 'email_after_retry' });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(noSleep).toHaveBeenNthCalledWith(1, 1000);
    const keys = (fetchImpl.mock.calls as unknown as FetchCall[]).map(
      ([, init]) => (init.headers as Record<string, string>)['Idempotency-Key']
    );
    expect(new Set(keys).size).toBe(1);
  });

  it('does not retry validation errors and never leaks the API key', async () => {
    const apiKey = 're_secret_value_1234567';
    const fetchImpl = jest.fn(async () =>
      jsonResponse(403, { name: 'validation_error', message: `Key ${apiKey} lacks access` })
    );

    const result = await sendWithResend(baseInput, { apiKey, fetchImpl, sleep: noSleep });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ ok: false, status: 403, retryable: false });
    expect(JSON.stringify(result)).not.toContain(apiKey);
  });

  it('gives up after the final attempt on network failures', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('getaddrinfo ENOTFOUND api.resend.com');
    });

    const result = await sendWithResend(baseInput, {
      apiKey: 're_test_abcdefghij',
      fetchImpl,
      sleep: noSleep,
      maxAttempts: 2,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ok: false,
      error: 'getaddrinfo ENOTFOUND api.resend.com',
      retryable: true,
    });
  });

  it('rejects sends without a key, recipient, or body before calling the API', async () => {
    const fetchImpl = jest.fn();

    await expect(sendWithResend(baseInput, { apiKey: '', fetchImpl })).resolves.toMatchObject({
      ok: false,
    });
    await expect(
      sendWithResend({ ...baseInput, to: ' ' }, { apiKey: 're_test_abcdefghij', fetchImpl })
    ).resolves.toMatchObject({ ok: false, retryable: false });
    await expect(
      sendWithResend({ to: 'a@b.test', subject: 'x' }, { apiKey: 're_test_abcdefghij', fetchImpl })
    ).resolves.toMatchObject({ ok: false, retryable: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
