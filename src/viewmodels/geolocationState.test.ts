import { describe, expect, it } from 'vitest';
import type { GeolocationState } from './geolocationState';
import { geolocationReducer, initialGeolocationState } from './geolocationState';
import { GeolocationError } from '@/domain/models/GeolocationError';
import { SAO_PAULO } from '@/test/fakes';

describe('geolocationReducer', () => {
  it('REQUEST a partir de idle vai para loading sem posição anterior', () => {
    expect(geolocationReducer(initialGeolocationState, { type: 'REQUEST' })).toEqual({
      status: 'loading',
      previous: null,
    });
  });

  it('REQUEST a partir de success preserva a posição anterior', () => {
    const state: GeolocationState = { status: 'success', position: SAO_PAULO };
    expect(geolocationReducer(state, { type: 'REQUEST' })).toEqual({
      status: 'loading',
      previous: SAO_PAULO,
    });
  });

  it('REJECT preserva a posição anterior', () => {
    const error = new GeolocationError('TIMEOUT');
    const state: GeolocationState = { status: 'loading', previous: SAO_PAULO };
    expect(geolocationReducer(state, { type: 'REJECT', error })).toEqual({
      status: 'error',
      error,
      previous: SAO_PAULO,
    });
  });

  it('RESET volta ao estado inicial', () => {
    const state: GeolocationState = { status: 'success', position: SAO_PAULO };
    expect(geolocationReducer(state, { type: 'RESET' })).toBe(initialGeolocationState);
  });
});
