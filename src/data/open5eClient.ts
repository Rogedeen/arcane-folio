// =============================================================================
// OPEN5E CLIENT V3 — Düzeltilmiş ve Geliştirilmiş
//
// DEĞİŞİKLİKLER:
// - V2 endpoint'lere tam geçiş (/v2/spells/, /v2/items/, /v2/magic-items/, /v2/creatures/)
// - ?search= yerine ?name__icontains= kullanımı
// - In-memory cache (5 dakika TTL) — aynı sorgu tekrar API'ye gitmiyor
// - Retry logic: 3 deneme, exponential backoff
// - Timeout 5 saniyeye çıkarıldı
// - Hata durumunda anlamlı hata mesajı
// - Creatures (canavar) endpoint desteği eklendi
// - Global search endpoint (/v2/search/) eklendi
// =============================================================================

import type { SpellData, ItemData } from '../types/content';

export interface MonsterAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_bonus?: number;
}

export interface MonsterSpecialAbility {
  name: string;
  desc: string;
}

// --- Canavar tipi (V3'te genişletildi: tüm aksiyonlar, hasarlar, alanlar, skill'ler) ---
export interface CreatureData {
  slug: string;
  name: string;
  type: string;
  size: string;
  alignment: string;
  challengeRating: string;
  armorClass: number;
  hitPoints: number;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  description?: string;
  source: string;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  skills?: Record<string, number> | string;
  specialAbilities?: MonsterSpecialAbility[];
  actions?: MonsterAction[];
  legendaryActions?: MonsterAction[];
  reactions?: MonsterAction[];
}

// --- Global arama sonucu ---
export interface SearchResult {
  slug: string;
  name: string;
  type: 'spell' | 'item' | 'creature' | 'condition' | 'rule';
  desc?: string;
  level?: number;
  school?: string;
  challengeRating?: string;
}

// --- Cache girişi ---
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

type FetchStatus = 'ok' | 'offline' | 'rate-limited' | 'error';

export interface Open5eResult<T> {
  data: T;
  status: FetchStatus;
  fromCache: boolean;
}

// =============================================================================

class Open5eClientV3 {
  private readonly baseUrl = 'https://api.open5e.com/v2';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 dakika
  private readonly TIMEOUT_MS = 5000;          // 5 saniye
  private readonly MAX_RETRIES = 2;

  private cache = new Map<string, CacheEntry<unknown>>();
  private lastStatus: FetchStatus = 'ok';

  // -------------------------------------------------------------------------
  // İç Yardımcılar
  // -------------------------------------------------------------------------

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private makeAbortController(): AbortController {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), this.TIMEOUT_MS);
    return ctrl;
  }

  private async fetchWithRetry(url: string, attempt = 0): Promise<Response | null> {
    try {
      const ctrl = this.makeAbortController();
      const res = await fetch(url, { signal: ctrl.signal });

      if (res.status === 429) {
        this.lastStatus = 'rate-limited';
        return null;
      }
      if (!res.ok) {
        this.lastStatus = 'error';
        return null;
      }

      this.lastStatus = 'ok';
      return res;
    } catch (err) {
      if (attempt < this.MAX_RETRIES) {
        // Exponential backoff: 500ms, 1000ms
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        return this.fetchWithRetry(url, attempt + 1);
      }
      this.lastStatus = 'offline';
      return null;
    }
  }

  private async fetchResults(path: string): Promise<unknown[]> {
    const url = `${this.baseUrl}${path}`;
    const cached = this.getCached<unknown[]>(url);
    if (cached) return cached;

    const res = await this.fetchWithRetry(url);
    if (!res) return [];

    const json = await res.json();
    const results = Array.isArray(json.results) ? json.results : [];
    this.setCached(url, results);
    return results;
  }

  // -------------------------------------------------------------------------
  // Dönüştürücüler
  // -------------------------------------------------------------------------

  private toSpellData(r: Record<string, unknown>): SpellData {
    // V2 API: level_integer yerine level_int, casting_time alanı
    const levelRaw = r['level_integer'] ?? r['level_int'] ?? r['level'];
    const level =
      typeof levelRaw === 'number'
        ? levelRaw
        : parseInt(String(levelRaw ?? '0'), 10) || 0;

    // V2: school objesi olabilir
    const schoolRaw = r['school'];
    const school =
      typeof schoolRaw === 'object' && schoolRaw !== null
        ? String((schoolRaw as Record<string, unknown>)['name'] ?? 'Evocation')
        : String(schoolRaw ?? 'Evocation');

    // V2: classes array of objects
    const classesRaw = r['classes'];
    const classes: string[] = Array.isArray(classesRaw)
      ? classesRaw.map((c: unknown) =>
          typeof c === 'string' ? c : String((c as Record<string, unknown>)?.name ?? c)
        )
      : [];

    return {
      slug: String(r['slug'] ?? r['key'] ?? ''),
      name: String(r['name'] ?? 'Unknown Spell'),
      level,
      school,
      castingTime: String(r['casting_time'] ?? r['castingTime'] ?? '1 action'),
      range: String(r['range'] ?? r['range_text'] ?? '60 feet'),
      components: String(r['components'] ?? r['components_text'] ?? 'V, S'),
      duration: String(r['duration'] ?? 'Instantaneous'),
      description: String(r['desc'] ?? r['description'] ?? ''),
      classes,
      prepared: false,
      source: 'Open5e',
      source_ref: String(
        (r['document'] as Record<string, unknown>)?.['name'] ?? 'Open5e API'
      ),
      license: 'Open Gaming / Open5e',
    };
  }

  private formatSpeed(speed: unknown): string {
    if (!speed) return '30 ft.';
    if (typeof speed === 'string') return speed;
    if (typeof speed === 'object' && speed !== null) {
      const s = speed as Record<string, unknown>;
      const parts: string[] = [];
      const unit = String(s['unit'] ?? 'ft.');
      if (s['walk'] !== undefined) parts.push(`${s['walk']} ${unit}`);
      if (s['swim'] !== undefined) parts.push(`swim ${s['swim']} ${unit}`);
      if (s['fly'] !== undefined) parts.push(`fly ${s['fly']} ${unit}`);
      if (s['burrow'] !== undefined) parts.push(`burrow ${s['burrow']} ${unit}`);
      if (s['climb'] !== undefined) parts.push(`climb ${s['climb']} ${unit}`);
      for (const [k, v] of Object.entries(s)) {
        if (!['walk', 'swim', 'fly', 'burrow', 'climb', 'unit'].includes(k) && typeof v === 'number') {
          parts.push(`${k} ${v} ${unit}`);
        }
      }
      return parts.length > 0 ? parts.join(', ') : '30 ft.';
    }
    return String(speed);
  }

  private formatLanguages(languages: unknown): string | undefined {
    if (!languages) return undefined;
    if (typeof languages === 'string') return languages;
    if (typeof languages === 'object' && languages !== null) {
      const l = languages as Record<string, unknown>;
      if (l['as_string']) return String(l['as_string']);
      if (Array.isArray(l['data'])) {
        const names = l['data']
          .map((d: unknown) => (d as Record<string, unknown>)?.['name'] || (d as Record<string, unknown>)?.['key'])
          .filter(Boolean);
        if (names.length > 0) return names.join(', ');
      }
    }
    return String(languages);
  }

  private formatSenses(r: Record<string, unknown>): string | undefined {
    if (r['senses'] && typeof r['senses'] === 'string') return r['senses'];
    const parts: string[] = [];
    if (r['darkvision_range']) parts.push(`Darkvision ${r['darkvision_range']} ft.`);
    if (r['blindsight_range']) parts.push(`Blindsight ${r['blindsight_range']} ft.`);
    if (r['tremorsense_range']) parts.push(`Tremorsense ${r['tremorsense_range']} ft.`);
    if (r['truesight_range']) parts.push(`Truesight ${r['truesight_range']} ft.`);
    if (r['passive_perception']) parts.push(`Passive Perception ${r['passive_perception']}`);
    return parts.length > 0 ? parts.join(', ') : undefined;
  }

  private toItemData(r: Record<string, unknown>): ItemData {
    const rawCat = r['category'];
    const categoryName = typeof rawCat === 'object' && rawCat !== null
      ? String((rawCat as Record<string, unknown>)['name'] ?? (rawCat as Record<string, unknown>)['key'] ?? '')
      : String(rawCat ?? r['type'] ?? '');
    const catLower = categoryName.toLowerCase();
    const nameLower = String(r['name'] ?? '').toLowerCase();

    const isWeapon = Boolean(r['weapon']) || catLower.includes('weapon');
    const isShield = catLower.includes('shield') || nameLower.includes('shield');
    const isArmor = !isShield && (Boolean(r['armor']) || catLower.includes('armor'));
    const isPotion = catLower.includes('potion') || nameLower.includes('potion');
    const isScroll = catLower.includes('scroll') || nameLower.includes('scroll');

    const mappedType: ItemData['type'] = isWeapon
      ? 'weapon'
      : isShield
      ? 'shield'
      : isArmor
      ? 'armor'
      : isPotion
      ? 'potion'
      : isScroll
      ? 'scroll'
      : 'gear';

    const propertiesRaw = r['properties'];
    const properties: string[] = Array.isArray(propertiesRaw)
      ? propertiesRaw.map((p: unknown) => {
          if (typeof p === 'string') return p;
          const obj = p as Record<string, unknown>;
          return String((obj['property'] as Record<string, unknown>)?.['name'] ?? obj['name'] ?? p);
        })
      : [];

    let rawCost = r['cost'] ?? r['rarity'] ?? '—';
    if (typeof rawCost === 'number' || (!isNaN(Number(rawCost)) && rawCost !== '—')) {
      rawCost = `${rawCost} gp`;
    }

    const rawWeight = r['weight'];
    const weightNum = typeof rawWeight === 'number'
      ? rawWeight
      : typeof rawWeight === 'string'
      ? parseFloat(rawWeight) || 0
      : 0;

    return {
      slug: String(r['slug'] ?? r['key'] ?? ''),
      name: String(r['name'] ?? 'Unknown Item'),
      type: mappedType,
      weight: weightNum,
      cost: String(rawCost),
      description: String(r['desc'] ?? r['description'] ?? ''),
      properties,
      quantity: 1,
      equipped: false,
      source: 'Open5e',
      source_ref: String(
        (r['document'] as Record<string, unknown>)?.['name'] ?? 'Open5e API'
      ),
      license: 'Open Gaming / Open5e',
    };
  }

  private toCreatureData(r: Record<string, unknown>): CreatureData {
    const abilityScores = (r['ability_scores'] as Record<string, unknown>) ?? r;

    // Actions parsing
    const rawActions = Array.isArray(r['actions']) ? (r['actions'] as Record<string, unknown>[]) : [];
    const actions: MonsterAction[] = rawActions.map((a) => ({
      name: String(a['name'] ?? 'Action'),
      desc: String(a['desc'] ?? ''),
      attack_bonus: typeof a['attack_bonus'] === 'number' ? a['attack_bonus'] : undefined,
      damage_dice: a['damage_dice'] ? String(a['damage_dice']) : undefined,
    }));

    // Special abilities parsing (traits or special_abilities)
    const rawAbilities = Array.isArray(r['special_abilities'])
      ? (r['special_abilities'] as Record<string, unknown>[])
      : Array.isArray(r['traits'])
      ? (r['traits'] as Record<string, unknown>[])
      : [];
    const specialAbilities: MonsterSpecialAbility[] = rawAbilities.map((a) => ({
      name: String(a['name'] ?? 'Ability'),
      desc: String(a['desc'] ?? ''),
    }));

    // Legendary actions
    const rawLeg = Array.isArray(r['legendary_actions']) ? (r['legendary_actions'] as Record<string, unknown>[]) : [];
    const legendaryActions: MonsterAction[] = rawLeg.map((a) => ({
      name: String(a['name'] ?? 'Legendary Action'),
      desc: String(a['desc'] ?? ''),
    }));

    // Reactions
    const rawReactions = Array.isArray(r['reactions']) ? (r['reactions'] as Record<string, unknown>[]) : [];
    const reactions: MonsterAction[] = rawReactions.map((a) => ({
      name: String(a['name'] ?? 'Reaction'),
      desc: String(a['desc'] ?? ''),
    }));

    // Resistances and immunities
    const resAndImm = r['resistances_and_immunities'] as Record<string, unknown> | undefined;
    const damageVulnerabilities = (r['damage_vulnerabilities'] ? String(r['damage_vulnerabilities']) : undefined)
      ?? (resAndImm?.['damage_vulnerabilities_display'] ? String(resAndImm['damage_vulnerabilities_display']) : undefined);
    const damageResistances = (r['damage_resistances'] ? String(r['damage_resistances']) : undefined)
      ?? (resAndImm?.['damage_resistances_display'] ? String(resAndImm['damage_resistances_display']) : undefined);
    const damageImmunities = (r['damage_immunities'] ? String(r['damage_immunities']) : undefined)
      ?? (resAndImm?.['damage_immunities_display'] ? String(resAndImm['damage_immunities_display']) : undefined);
    const conditionImmunities = (r['condition_immunities'] ? String(r['condition_immunities']) : undefined)
      ?? (resAndImm?.['condition_immunities_display'] ? String(resAndImm['condition_immunities_display']) : undefined);

    return {
      slug: String(r['slug'] ?? r['key'] ?? ''),
      name: String(r['name'] ?? 'Unknown Creature'),
      type: String(r['type'] ?? ''),
      size: String(r['size'] ?? 'Medium'),
      alignment: String(r['alignment'] ?? ''),
      challengeRating: String(r['challenge_rating'] ?? r['cr'] ?? '0'),
      armorClass: Number(r['armor_class'] ?? r['ac'] ?? 10),
      hitPoints: Number(r['hit_points'] ?? r['hp'] ?? 1),
      speed: this.formatSpeed(r['speed']),
      str: Number(abilityScores['strength'] ?? abilityScores['str'] ?? 10),
      dex: Number(abilityScores['dexterity'] ?? abilityScores['dex'] ?? 10),
      con: Number(abilityScores['constitution'] ?? abilityScores['con'] ?? 10),
      int: Number(abilityScores['intelligence'] ?? abilityScores['int'] ?? 10),
      wis: Number(abilityScores['wisdom'] ?? abilityScores['wis'] ?? 10),
      cha: Number(abilityScores['charisma'] ?? abilityScores['cha'] ?? 10),
      description: String(r['desc'] ?? ''),
      source: String(
        (r['document'] as Record<string, unknown>)?.['name'] ?? 'Open5e API'
      ),
      damageVulnerabilities: damageVulnerabilities || undefined,
      damageResistances: damageResistances || undefined,
      damageImmunities: damageImmunities || undefined,
      conditionImmunities: conditionImmunities || undefined,
      senses: this.formatSenses(r),
      languages: this.formatLanguages(r['languages']),
      actions: actions.length > 0 ? actions : undefined,
      specialAbilities: specialAbilities.length > 0 ? specialAbilities : undefined,
      legendaryActions: legendaryActions.length > 0 ? legendaryActions : undefined,
      reactions: reactions.length > 0 ? reactions : undefined,
    };
  }

  // -------------------------------------------------------------------------
  // Genel arama endpoint'i
  // -------------------------------------------------------------------------

  async globalSearch(query: string): Promise<Open5eResult<SearchResult[]>> {
    if (!query.trim()) {
      return { data: [], status: 'ok', fromCache: true };
    }

    const cacheKey = `global:${query.toLowerCase()}`;
    const cached = this.getCached<SearchResult[]>(cacheKey);
    if (cached) return { data: cached, status: 'ok', fromCache: true };

    const url = `${this.baseUrl}/search/?query=${encodeURIComponent(query)}&limit=20`;
    const res = await this.fetchWithRetry(url);

    if (!res) {
      return { data: [], status: this.lastStatus, fromCache: false };
    }

    const json = await res.json();
    const raw: unknown[] = Array.isArray(json.results) ? json.results : [];
    const data: SearchResult[] = raw.map((r) => {
      const item = r as Record<string, unknown>;
      return {
        slug: String(item['slug'] ?? item['key'] ?? ''),
        name: String(item['name'] ?? ''),
        type: (String(item['route'] ?? 'rule')
          .replace(/s\/?$/, '')
          .toLowerCase()) as SearchResult['type'],
        desc: String(item['desc'] ?? item['text'] ?? ''),
        level: item['level'] != null ? Number(item['level']) : undefined,
        school: item['school'] ? String(item['school']) : undefined,
        challengeRating: item['cr'] ? String(item['cr']) : undefined,
      };
    });

    this.setCached(cacheKey, data);
    return { data, status: 'ok', fromCache: false };
  }

  // -------------------------------------------------------------------------
  // Büyü Arama
  // -------------------------------------------------------------------------

  async searchSpells(query: string, limit = 25): Promise<Open5eResult<SpellData[]>> {
    if (!query.trim()) {
      return { data: [], status: 'ok', fromCache: true };
    }

    const path = `/spells/?name__icontains=${encodeURIComponent(query)}&limit=${limit}&document__key__in=srd-2014`;
    const raw = await this.fetchResults(path);

    if (raw.length === 0 && this.lastStatus !== 'ok') {
      return { data: [], status: this.lastStatus, fromCache: false };
    }

    const data = (raw as Record<string, unknown>[]).map((r) => this.toSpellData(r));
    return { data, status: this.lastStatus, fromCache: false };
  }

  async getSpell(slug: string): Promise<SpellData | null> {
    const cacheKey = `spell:${slug}`;
    const cached = this.getCached<SpellData>(cacheKey);
    if (cached) return cached;

    const res = await this.fetchWithRetry(`${this.baseUrl}/spells/${slug}/`);
    if (!res) return null;

    const r = (await res.json()) as Record<string, unknown>;
    const spell = this.toSpellData(r);
    this.setCached(cacheKey, spell);
    return spell;
  }

  // -------------------------------------------------------------------------
  // Eşya Arama
  // -------------------------------------------------------------------------

  async searchItems(query: string, limit = 25): Promise<Open5eResult<ItemData[]>> {
    const rawTrimmed = query.trim();
    // Parantez içi Türkçe çevirileri veya ekleri temizle (örn. "Longsword (Uzun Kılıç)" -> "Longsword")
    const cleaned = rawTrimmed.replace(/\s*\([^)]*\)/g, '').trim();

    // Türkçe yaygın terimleri İngilizce karşılığına çevir
    const trMap: Record<string, string> = {
      'kılıç': 'sword',
      'uzun kılıç': 'longsword',
      'kısa kılıç': 'shortsword',
      'büyük kılıç': 'greatsword',
      'kalkan': 'shield',
      'zırh': 'armor',
      'zincir zırh': 'chain mail',
      'deri zırh': 'leather armor',
      'plaka zırh': 'plate',
      'iksir': 'potion',
      'şifa iksiri': 'potion of healing',
      'şifa': 'healing',
      'yay': 'bow',
      'kısa yay': 'shortbow',
      'uzun yay': 'longbow',
      'arbalet': 'crossbow',
      'balta': 'axe',
      'savaş baltası': 'battleaxe',
      'büyük balta': 'greataxe',
      'hançer': 'dagger',
      'mızrak': 'spear',
      'asa': 'staff',
      'meşale': 'torch',
      'halat': 'rope',
      'ip': 'rope',
      'sırt çantası': 'backpack',
      'kumanya': 'rations',
    };

    const effectiveQuery = trMap[cleaned.toLowerCase()] || cleaned;

    const itemPath = effectiveQuery
      ? `/items/?name__icontains=${encodeURIComponent(effectiveQuery)}&limit=${limit}`
      : `/items/?limit=${limit}`;
    const itemRaw = await this.fetchResults(itemPath);

    if (itemRaw.length > 0) {
      const data = (itemRaw as Record<string, unknown>[]).map((r) =>
        this.toItemData(r)
      );
      return { data, status: 'ok', fromCache: false };
    }

    // Bulunamazsa sihirli eşyalara bak
    const magicPath = effectiveQuery
      ? `/magic-items/?name__icontains=${encodeURIComponent(effectiveQuery)}&limit=${limit}`
      : `/magic-items/?limit=${limit}`;
    const magicRaw = await this.fetchResults(magicPath);

    const data = (magicRaw as Record<string, unknown>[]).map((r) =>
      this.toItemData(r)
    );
    return { data, status: this.lastStatus, fromCache: false };
  }

  // -------------------------------------------------------------------------
  // Canavar Arama (V3'te Yeni)
  // -------------------------------------------------------------------------

  async searchCreatures(
    query: string,
    maxCr?: number,
    limit = 20
  ): Promise<Open5eResult<CreatureData[]>> {
    let path = `/creatures/?limit=${limit}`;
    if (query.trim()) {
      path += `&name__icontains=${encodeURIComponent(query)}`;
    }
    if (maxCr !== undefined) {
      path += `&challenge_rating_decimal__lte=${maxCr}`;
    }

    const raw = await this.fetchResults(path);
    const data = (raw as Record<string, unknown>[]).map((r) =>
      this.toCreatureData(r)
    );
    return { data, status: this.lastStatus, fromCache: false };
  }

  // -------------------------------------------------------------------------
  // Status
  // -------------------------------------------------------------------------

  getLastStatus(): FetchStatus {
    return this.lastStatus;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const open5eClient = new Open5eClientV3();
