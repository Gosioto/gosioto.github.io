import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildVoiceRtcConfiguration, parseIceServersFromEnv } from './rtcConfig';

describe('parseIceServersFromEnv', () => {
  it('returns empty for undefined or blank', () => {
    expect(parseIceServersFromEnv(undefined)).toEqual([]);
    expect(parseIceServersFromEnv('')).toEqual([]);
    expect(parseIceServersFromEnv('   ')).toEqual([]);
  });

  it('returns empty for invalid JSON', () => {
    expect(parseIceServersFromEnv('not json')).toEqual([]);
  });

  it('returns empty when JSON is not an array', () => {
    expect(parseIceServersFromEnv('{}')).toEqual([]);
    expect(parseIceServersFromEnv('null')).toEqual([]);
  });

  it('parses valid array of ice servers', () => {
    const j = JSON.stringify([{ urls: 'turn:example.com:3478', username: 'u', credential: 'p' }]);
    expect(parseIceServersFromEnv(j)).toEqual([{ urls: 'turn:example.com:3478', username: 'u', credential: 'p' }]);
  });

  it('accepts urls as string array', () => {
    expect(parseIceServersFromEnv('[{"urls":["stun:a","stun:b"]}]')).toEqual([{ urls: ['stun:a', 'stun:b'] }]);
  });

  it('filters non-objects and invalid urls field', () => {
    expect(parseIceServersFromEnv('[null, "x", {"urls":"stun:x"}]')).toEqual([{ urls: 'stun:x' }]);
    expect(parseIceServersFromEnv('[{"urls":123},{"urls":"ok"}]')).toEqual([{ urls: 'ok' }]);
    expect(parseIceServersFromEnv('[{"noUrls":true}]')).toEqual([]);
  });

  it('filters objects without urls key', () => {
    expect(parseIceServersFromEnv('[{}]')).toEqual([]);
  });
});

describe('buildVoiceRtcConfiguration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes default STUN', () => {
    vi.stubEnv('VITE_ICE_SERVERS', '');
    const c = buildVoiceRtcConfiguration();
    expect(c.iceServers?.length).toBeGreaterThanOrEqual(1);
    expect(c.iceServers?.[0]).toEqual({ urls: 'stun:stun.l.google.com:19302' });
  });

  it('merges VITE_ICE_SERVERS with default STUN', () => {
    vi.stubEnv('VITE_ICE_SERVERS', '[{"urls":"turn:example:3478","username":"u","credential":"p"}]');
    const c = buildVoiceRtcConfiguration();
    expect(c.iceServers).toHaveLength(2);
    expect(c.iceServers?.[0]).toEqual({ urls: 'stun:stun.l.google.com:19302' });
    expect(c.iceServers?.[1]).toEqual({ urls: 'turn:example:3478', username: 'u', credential: 'p' });
  });
});
