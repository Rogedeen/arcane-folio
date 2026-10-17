export type UserRole = 'dm' | 'player';

export interface PartyMember {
  id: string;
  name: string;
  charClass: string;
  level: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  passivePerception: number;
  passiveInvestigation: number;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  activeConditions: string[];
  playerName: string;
  skillModifiers?: Record<string, number>;
  proficientSkills?: string[];
  expertSkills?: string[];
}

export interface Campaign {
  id: string;
  title: string;
  dmName: string;
  inviteCode: string;
  members: PartyMember[];
  createdAt: string;
}

export type SyncEventType =
  | 'HP_UPDATE'
  | 'CONDITION_UPDATE'
  | 'MEMBER_JOIN'
  | 'MEMBER_UPDATE'
  | 'PING'
  | 'DICE_ROLLED'
  | 'ENCOUNTER_UPDATE'
  | 'INSPIRATION_AWARDED';

export interface SyncEvent {
  type: SyncEventType;
  campaignId: string;
  senderRole: UserRole;
  payload: any;
  timestamp: string;
}
