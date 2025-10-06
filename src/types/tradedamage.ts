// Types for TRADEdamage game data

export interface Unit {
  id: string;
  name: string;
  icon: string;
  type: 'melee' | 'ranged';
  category: 'mercenary' | 'transport';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level: number;
  maxLevel: number;
  health: number;
  damage: number;
  attackSpeed: number;
  critChance: number;
  critDamage: number;
  cost: number;
  skill1: string;
  skill2: string;
  description: string;
}

export interface Scroll {
  id: string;
  name: string;
  icon: string;
  effect: string;
  effectValue: number;
  cost: number;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  passiveBonus: string;
  bonusValue: number;
  cost: number;
  description: string;
  combinations?: BadgeCombination[];
}

export interface BadgeCombination {
  badgeIds: string[];
  uniqueBonus: string;
  bonusValue: number;
}

export interface Food {
  id: string;
  name: string;
  icon: string;
  effect: string;
  effectValue: number;
  cost: number;
  description: string;
}

export interface SquadUnit {
  unit: Unit;
  scrolls: Scroll[];
  badges: Badge[];
  food?: Food;
}

export interface Squad {
  units: SquadUnit[];
  transport: SquadUnit | null;
}

export interface SquadStats {
  totalDPS: number;
  totalHealth: number;
  totalDamage: number;
  totalDamageWithCrits: number;
  averageCritChance: number;
  averageCritDamage: number;
  totalCost: number;
}
