import { describe, it, expect, vi, afterEach } from 'vitest';
import { contentService } from '../../src/data/contentService';

describe('contentService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads full local spell/item library from content files', () => {
    expect(contentService.getInitialSpells().length).toBeGreaterThanOrEqual(50);
    expect(contentService.getInitialItems().length).toBeGreaterThanOrEqual(50);
  });

  it('returns local spell matches without calling network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const results = await contentService.getSpells('fireball');
    expect(results.some((spell) => spell.name === 'Fireball')).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses Open5e API when no local spell match exists', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ slug: 'custom-bolt', name: 'Custom Bolt', level: 1, desc: 'API spell' }]
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await contentService.getSpells('zzznomatch');
    expect(results[0]?.name).toBe('Custom Bolt');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
