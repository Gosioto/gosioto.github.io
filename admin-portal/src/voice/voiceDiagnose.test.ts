import { describe, expect, it } from 'vitest';
import {
  diagnoseDisplayMediaFailure,
  diagnoseDisplayMediaUnavailable,
} from './voiceDiagnose';

describe('voiceDiagnose', () => {
  it('diagnoseDisplayMediaUnavailable returns API_MISSING', () => {
    const d = diagnoseDisplayMediaUnavailable();
    expect(d.code).toBe('DISPLAY_MEDIA_API_MISSING');
    expect(d.where).toContain('Dashboard');
    expect(d.suggestedFix.length).toBeGreaterThan(10);
  });

  it('maps NotAllowedError', () => {
    const err = new DOMException('denied', 'NotAllowedError');
    const d = diagnoseDisplayMediaFailure(err);
    expect(d.code).toBe('DISPLAY_MEDIA_NOT_ALLOWED');
    expect(d.rawName).toBe('NotAllowedError');
  });

  it('maps NotFoundError', () => {
    const err = new DOMException('x', 'NotFoundError');
    expect(diagnoseDisplayMediaFailure(err).code).toBe('DISPLAY_MEDIA_NOT_FOUND');
  });

  it('maps InvalidStateError', () => {
    const err = new DOMException('x', 'InvalidStateError');
    expect(diagnoseDisplayMediaFailure(err).code).toBe('DISPLAY_MEDIA_INVALID_STATE');
  });

  it('maps AbortError', () => {
    const err = new DOMException('x', 'AbortError');
    expect(diagnoseDisplayMediaFailure(err).code).toBe('DISPLAY_MEDIA_ABORT');
  });

  it('unknown DOMException name → DISPLAY_MEDIA_UNKNOWN', () => {
    const err = new DOMException('weird', 'HierarchyRequestError');
    const d = diagnoseDisplayMediaFailure(err);
    expect(d.code).toBe('DISPLAY_MEDIA_UNKNOWN');
    expect(d.rawName).toBe('HierarchyRequestError');
  });

  it('non-DOM rejection → UNKNOWN with message', () => {
    const d = diagnoseDisplayMediaFailure(new Error('oops'));
    expect(d.code).toBe('DISPLAY_MEDIA_UNKNOWN');
    expect(d.rawMessage).toBe('oops');
  });

  it('string rejection uses String branch', () => {
    const d = diagnoseDisplayMediaFailure('user cancelled');
    expect(d.code).toBe('DISPLAY_MEDIA_UNKNOWN');
    expect(d.rawMessage).toBe('user cancelled');
  });

  it('numeric rejection stringifies', () => {
    const d = diagnoseDisplayMediaFailure(404);
    expect(d.rawMessage).toBe('404');
  });

  it('arbitrary reject value stringifies', () => {
    const d = diagnoseDisplayMediaFailure({ foo: 1 });
    expect(d.code).toBe('DISPLAY_MEDIA_UNKNOWN');
    expect(d.rawMessage).toBe('[object Object]');
  });

  it('unknown DOMException name maps to UNKNOWN with rawName', () => {
    const err = new DOMException('m', 'HierarchyRequestError');
    const d = diagnoseDisplayMediaFailure(err);
    expect(d.code).toBe('DISPLAY_MEDIA_UNKNOWN');
    expect(d.rawName).toBe('HierarchyRequestError');
  });

  it('unknown DOMException with empty name uses fallback in likelyCause', () => {
    const err = new DOMException('only message', '');
    const d = diagnoseDisplayMediaFailure(err);
    expect(d.code).toBe('DISPLAY_MEDIA_UNKNOWN');
    expect(d.likelyCause).toMatch(/unknown/i);
  });
});
