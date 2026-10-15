import type { SpellData, ItemData } from './content';
import type { CreatureData } from '../data/open5eClient';
import type { ConditionDefinition } from '../rules/conditions';

export type ReferenceContentType = 'spell' | 'item' | 'condition' | 'creature' | 'rule';

export interface RuleContent {
  title: string;
  category?: string;
  summary: string;
  details?: string;
  bullets?: string[];
  reference?: string;
}

export type ReferenceData =
  | { type: 'spell'; data: SpellData }
  | { type: 'item'; data: ItemData }
  | { type: 'condition'; data: ConditionDefinition }
  | { type: 'creature'; data: CreatureData }
  | { type: 'rule'; data: RuleContent };

export interface ReferenceContextValue {
  isOpen: boolean;
  activeItem: ReferenceData | null;
  openReference: (item: ReferenceData) => void;
  closeReference: () => void;
}
