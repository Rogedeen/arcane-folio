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
  activeConditions: string[];
  playerName: string;
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
  | 'PING';

export interface SyncEvent {
  type: SyncEventType;
  campaignId: string;
  senderRole: UserRole;
  payload: any;
  timestamp: string;
}
