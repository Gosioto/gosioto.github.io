import { describe, expect, it } from 'vitest';
import {
  clearPendingIceStore,
  drainPendingIce,
  enqueuePendingIce,
  type PendingIceStore,
} from './iceQueue';

describe('iceQueue', () => {
  it('enqueuePendingIce appends in order', () => {
    const store: PendingIceStore = {};
    enqueuePendingIce(store, 'u1', { candidate: 'a' });
    enqueuePendingIce(store, 'u1', { candidate: 'b' });
    expect(store['u1']).toEqual([{ candidate: 'a' }, { candidate: 'b' }]);
  });

  it('drainPendingIce invokes callback and clears queue', () => {
    const store: PendingIceStore = {};
    enqueuePendingIce(store, 'u1', { candidate: 'x' });
    const seen: RTCIceCandidateInit[] = [];
    drainPendingIce(store, 'u1', (c) => seen.push(c));
    expect(seen).toEqual([{ candidate: 'x' }]);
    expect(store['u1']).toBeUndefined();
  });

  it('drainPendingIce on empty is no-op', () => {
    const store: PendingIceStore = {};
    let n = 0;
    drainPendingIce(store, 'missing', () => {
      n += 1;
    });
    expect(n).toBe(0);
  });

  it('clearPendingIceStore removes all peers', () => {
    const store: PendingIceStore = {};
    enqueuePendingIce(store, 'a', {});
    enqueuePendingIce(store, 'b', {});
    clearPendingIceStore(store);
    expect(Object.keys(store).length).toBe(0);
  });
});
