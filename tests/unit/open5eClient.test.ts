import { afterEach, describe, expect, it, vi } from 'vitest';
import { open5eClient } from '../../src/data/open5eClient';

describe('open5eClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('queries spells from Open5e v2 endpoint and maps response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            slug: 'lightning-lance',
            name: 'Lightning Lance',
            level: '3',
            school: 'Evocation',
            casting_time: '1 action',
            range: '120 feet',
            components: 'V, S',
            duration: 'Instantaneous',
            desc: 'Deals lightning damage.'
          }
        ]
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await open5eClient.searchSpells('lightning');
    expect(results[0]?.name).toBe('Lightning Lance');
    expect(results[0]?.level).toBe(3);
    expect(fetchMock.mock.calls[0][0]).toContain('/v2/spells/');
  });

  it('falls back from equipment to magicitems endpoint for item search', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ slug: 'ring-of-warding', name: 'Ring of Warding', type: 'gear', desc: 'Protective ring' }]
        })
      });
    vi.stubGlobal('fetch', fetchMock);

    const results = await open5eClient.searchItems('ring');
    expect(results[0]?.name).toBe('Ring of Warding');
    expect(fetchMock.mock.calls[0][0]).toContain('/v2/equipment/');
    expect(fetchMock.mock.calls[1][0]).toContain('/v2/magicitems/');
  });

  it('returns empty list on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const results = await open5eClient.searchSpells('anything');
    expect(results).toEqual([]);
  });
});
