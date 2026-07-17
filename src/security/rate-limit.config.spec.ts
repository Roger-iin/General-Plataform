import { getCredentialTracker, getIpTracker } from './rate-limit.config';

describe('rate-limit trackers', () => {
  it('should track general requests by IP', () => {
    expect(getIpTracker({ ip: '192.0.2.1' })).toBe('192.0.2.1');
  });

  it('should normalize and hash email without exposing it in the tracker', () => {
    const firstTracker = getCredentialTracker({
      ip: '192.0.2.1',
      body: { email: ' User@Example.com ' },
    });
    const secondTracker = getCredentialTracker({
      ip: '192.0.2.1',
      body: { email: 'user@example.com' },
    });

    expect(firstTracker).toBe(secondTracker);
    expect(firstTracker.startsWith('192.0.2.1:')).toBe(true);
    expect(firstTracker).not.toContain('user@example.com');
  });

  it('should group requests without a valid email as anonymous', () => {
    expect(
      getCredentialTracker({ ip: '192.0.2.1', body: { email: 123 } }),
    ).toBe('192.0.2.1:anonymous');
  });
});
