// =============================================================================
// D&D 5E CLASS & FEATURE REGISTRY (OCP — OPEN/CLOSED PRINCIPLE)
// Sınıfların ve alt sınıfların kod tabanındaki switch-case'leri bozmadan
// dinamik olarak kaydedilmesini ve sorgulanmasını sağlar.
// =============================================================================

import type { AbilityName } from '../types/character';
import { SUBCLASSES, type SubclassDefinition } from './subclasses';

export interface ClassDefinition {
  id: string;
  name: string;
  nameTr: string;
  hitDie: number;
  primaryAbility: AbilityName;
  savingThrows: AbilityName[];
  isCaster: boolean;
  spellcastingAbility?: 'int' | 'wis' | 'cha';
  description: string;
}

class ClassRegistryService {
  private classes = new Map<string, ClassDefinition>();
  private subclasses = new Map<string, SubclassDefinition>();

  constructor() {
    this.registerStandardClasses();
    this.registerStandardSubclasses();
  }

  public registerClass(cls: ClassDefinition): void {
    this.classes.set(cls.id.toLowerCase(), cls);
  }

  public getClass(id: string): ClassDefinition | undefined {
    return this.classes.get(id.toLowerCase());
  }

  public getAllClasses(): ClassDefinition[] {
    return Array.from(this.classes.values());
  }

  public registerSubclass(subclass: SubclassDefinition): void {
    this.subclasses.set(subclass.id.toLowerCase(), subclass);
  }

  public getSubclass(id: string): SubclassDefinition | undefined {
    return this.subclasses.get(id.toLowerCase());
  }

  public getSubclassesForClass(classId: string): SubclassDefinition[] {
    return Array.from(this.subclasses.values()).filter(
      (s) => s.classId.toLowerCase() === classId.toLowerCase()
    );
  }

  public isCaster(classId: string, subclassId?: string): boolean {
    const cls = this.getClass(classId);
    if (cls?.isCaster) return true;

    if (subclassId) {
      const sub = this.getSubclass(subclassId);
      if (sub?.isSpellcaster) return true;
    }
    return false;
  }

  public getHitDie(classId: string): number {
    return this.getClass(classId)?.hitDie ?? 8;
  }

  public getSavingThrows(classId: string): AbilityName[] {
    return this.getClass(classId)?.savingThrows ?? ['str', 'con'];
  }

  private registerStandardClasses(): void {
    const standard: ClassDefinition[] = [
      {
        id: 'barbarian',
        name: 'Barbarian',
        nameTr: 'Barbar',
        hitDie: 12,
        primaryAbility: 'str',
        savingThrows: ['str', 'con'],
        isCaster: false,
        description: 'Vahşi öfkesiyle savaş alanını kasıp kavuran ilkel savaşçı.',
      },
      {
        id: 'bard',
        name: 'Bard',
        nameTr: 'Ozan',
        hitDie: 8,
        primaryAbility: 'cha',
        savingThrows: ['dex', 'cha'],
        isCaster: true,
        spellcastingAbility: 'cha',
        description: 'Müziğin ve kelimelerin kadim büyüsüyle dostlarına ilham veren büyücü.',
      },
      {
        id: 'cleric',
        name: 'Cleric',
        nameTr: 'Rahip',
        hitDie: 8,
        primaryAbility: 'wis',
        savingThrows: ['wis', 'cha'],
        isCaster: true,
        spellcastingAbility: 'wis',
        description: 'Tanrıların kutsal ışığı ve şifasıyla kutsanmış ruhban savaşçı.',
      },
      {
        id: 'druid',
        name: 'Druid',
        nameTr: 'Druid',
        hitDie: 8,
        primaryAbility: 'wis',
        savingThrows: ['int', 'wis'],
        isCaster: true,
        spellcastingAbility: 'wis',
        description: 'Doğanın dengesini koruyan ve vahşi biçimlere bürünen doğa koruyucusu.',
      },
      {
        id: 'fighter',
        name: 'Fighter',
        nameTr: 'Savaşçı',
        hitDie: 10,
        primaryAbility: 'str',
        savingThrows: ['str', 'con'],
        isCaster: false,
        description: 'Silahların ve taktiklerin ustası, cephelerin vazgeçilmez kalkanı.',
      },
      {
        id: 'monk',
        name: 'Monk',
        nameTr: 'Keşiş',
        hitDie: 8,
        primaryAbility: 'dex',
        savingThrows: ['str', 'dex'],
        isCaster: false,
        description: 'Bedenini ve ruhunu ölümcül bir silaha dönüştüren Ki ustası.',
      },
      {
        id: 'paladin',
        name: 'Paladin',
        nameTr: 'Paladin',
        hitDie: 10,
        primaryAbility: 'str',
        savingThrows: ['wis', 'cha'],
        isCaster: true,
        spellcastingAbility: 'cha',
        description: 'Kutsal yeminiyle karanlığa kılıç çeken adalet şövalyesi.',
      },
      {
        id: 'ranger',
        name: 'Ranger',
        nameTr: 'Kolcu',
        hitDie: 10,
        primaryAbility: 'dex',
        savingThrows: ['str', 'dex'],
        isCaster: true,
        spellcastingAbility: 'wis',
        description: 'Vahşi doğanın sınırlarını koruyan iz sürücü ve avcı.',
      },
      {
        id: 'rogue',
        name: 'Rogue',
        nameTr: 'Hırsız / Düzenbaz',
        hitDie: 8,
        primaryAbility: 'dex',
        savingThrows: ['dex', 'int'],
        isCaster: false,
        description: 'Gözlerden uzak hareket eden gizlilik ve ölümcül sürpriz vuruş uzmanı.',
      },
      {
        id: 'sorcerer',
        name: 'Sorcerer',
        nameTr: 'Büyücü (Kandan Gelen)',
        hitDie: 6,
        primaryAbility: 'cha',
        savingThrows: ['con', 'cha'],
        isCaster: true,
        spellcastingAbility: 'cha',
        description: 'Damarlarındaki ejderha veya kozmik kanla büyüyü içgüdüsel yöneten sihirbaz.',
      },
      {
        id: 'warlock',
        name: 'Warlock',
        nameTr: 'Ruhban / Cadı',
        hitDie: 8,
        primaryAbility: 'cha',
        savingThrows: ['wis', 'cha'],
        isCaster: true,
        spellcastingAbility: 'cha',
        description: 'Kudretli dünya dışı varlıklarla pakt kurarak esrarengiz güçler edinen arayışçı.',
      },
      {
        id: 'wizard',
        name: 'Wizard',
        nameTr: 'Büyücü (Akademik)',
        hitDie: 6,
        primaryAbility: 'int',
        savingThrows: ['int', 'wis'],
        isCaster: true,
        spellcastingAbility: 'int',
        description: 'Yılların kadim kütüphane çalışmalarıyla arkana sanatlarını söken bilgin.',
      },
    ];

    standard.forEach((c) => this.registerClass(c));
  }

  private registerStandardSubclasses(): void {
    Object.values(SUBCLASSES).forEach((sub) => this.registerSubclass(sub));
  }
}

export const classRegistry = new ClassRegistryService();
