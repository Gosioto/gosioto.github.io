import { Unit, SquadUnit, Squad, SquadStats, Scroll, Badge, Food } from '@/types/tradedamage';

// Calculate DPS for a single unit
export const calculateUnitDPS = (unit: SquadUnit): number => {
  let damage = unit.unit.damage;
  let attackSpeed = unit.unit.attackSpeed;
  let critChance = unit.unit.critChance;
  let critDamage = unit.unit.critDamage;

  // Apply scroll bonuses
  unit.scrolls.forEach(scroll => {
    switch (scroll.effect) {
      case 'Увеличивает урон':
        damage *= (1 + scroll.effectValue / 100);
        break;
      case 'Увеличивает скорость атаки':
        attackSpeed *= (1 + scroll.effectValue / 100);
        break;
      case 'Увеличивает шанс крита':
        critChance += scroll.effectValue;
        break;
    }
  });

  // Apply badge bonuses
  unit.badges.forEach(badge => {
    switch (badge.passiveBonus) {
      case 'Увеличивает урон в ближнем бою':
        if (unit.unit.type === 'melee') {
          damage *= (1 + badge.bonusValue / 100);
        }
        break;
      case 'Увеличивает урон в дальнем бою':
        if (unit.unit.type === 'ranged') {
          damage *= (1 + badge.bonusValue / 100);
        }
        break;
      case 'Увеличивает скорость атаки':
        attackSpeed *= (1 + badge.bonusValue / 100);
        break;
    }
  });

  // Apply food bonuses
  if (unit.food) {
    switch (unit.food.effect) {
      case 'Увеличивает урон':
        damage *= (1 + unit.food.effectValue / 100);
        break;
      case 'Увеличивает скорость атаки':
        attackSpeed *= (1 + unit.food.effectValue / 100);
        break;
      case 'Увеличивает шанс крита':
        critChance += unit.food.effectValue;
        break;
    }
  }

  // Calculate DPS with crits
  const critMultiplier = 1 + (critChance / 100) * (critDamage - 1);
  return damage * attackSpeed * critMultiplier;
};

// Calculate total health for a unit
export const calculateUnitHealth = (unit: SquadUnit): number => {
  let health = unit.unit.health;

  // Apply scroll bonuses
  unit.scrolls.forEach(scroll => {
    if (scroll.effect === 'Увеличивает здоровье') {
      health *= (1 + scroll.effectValue / 100);
    }
  });

  // Apply badge bonuses
  unit.badges.forEach(badge => {
    if (badge.passiveBonus === 'Увеличивает здоровье') {
      health *= (1 + badge.bonusValue / 100);
    }
  });

  // Apply food bonuses
  if (unit.food && unit.food.effect === 'Увеличивает здоровье') {
    health *= (1 + unit.food.effectValue / 100);
  }

  return Math.round(health);
};

// Calculate total damage for a unit
export const calculateUnitDamage = (unit: SquadUnit): number => {
  let damage = unit.unit.damage;

  // Apply scroll bonuses
  unit.scrolls.forEach(scroll => {
    if (scroll.effect === 'Увеличивает урон') {
      damage *= (1 + scroll.effectValue / 100);
    }
  });

  // Apply badge bonuses
  unit.badges.forEach(badge => {
    if (badge.passiveBonus === 'Увеличивает урон в ближнем бою' && unit.unit.type === 'melee') {
      damage *= (1 + badge.bonusValue / 100);
    }
    if (badge.passiveBonus === 'Увеличивает урон в дальнем бою' && unit.unit.type === 'ranged') {
      damage *= (1 + badge.bonusValue / 100);
    }
  });

  // Apply food bonuses
  if (unit.food && unit.food.effect === 'Увеличивает урон') {
    damage *= (1 + unit.food.effectValue / 100);
  }

  return Math.round(damage);
};

// Calculate squad statistics
export const calculateSquadStats = (squad: Squad): SquadStats => {
  const allUnits = [...squad.units];
  if (squad.transport) {
    allUnits.push(squad.transport);
  }

  const totalDPS = allUnits.reduce((sum, unit) => sum + calculateUnitDPS(unit), 0);
  const totalHealth = allUnits.reduce((sum, unit) => sum + calculateUnitHealth(unit), 0);
  const totalDamage = allUnits.reduce((sum, unit) => sum + calculateUnitDamage(unit), 0);
  
  // Calculate average crit chance
  const averageCritChance = allUnits.reduce((sum, unit) => {
    let critChance = unit.unit.critChance;
    
    // Apply bonuses
    unit.scrolls.forEach(scroll => {
      if (scroll.effect === 'Увеличивает шанс крита') {
        critChance += scroll.effectValue;
      }
    });
    
    if (unit.food && unit.food.effect === 'Увеличивает шанс крита') {
      critChance += unit.food.effectValue;
    }
    
    return sum + critChance;
  }, 0) / allUnits.length;

  // Calculate average crit damage
  const averageCritDamage = allUnits.reduce((sum, unit) => sum + unit.unit.critDamage, 0) / allUnits.length;

  // Calculate total damage with max crits
  const totalDamageWithCrits = allUnits.reduce((sum, unit) => {
    const damage = calculateUnitDamage(unit);
    const critDamage = unit.unit.critDamage;
    return sum + (damage * critDamage);
  }, 0);

  // Calculate total cost
  const totalCost = allUnits.reduce((sum, unit) => {
    let cost = unit.unit.cost;
    cost += unit.scrolls.reduce((scrollSum, scroll) => scrollSum + scroll.cost, 0);
    cost += unit.badges.reduce((badgeSum, badge) => badgeSum + badge.cost, 0);
    if (unit.food) {
      cost += unit.food.cost;
    }
    return sum + cost;
  }, 0);

  return {
    totalDPS: Math.round(totalDPS),
    totalHealth,
    totalDamage,
    totalDamageWithCrits: Math.round(totalDamageWithCrits),
    averageCritChance: Math.round(averageCritChance * 100) / 100,
    averageCritDamage: Math.round(averageCritDamage * 100) / 100,
    totalCost
  };
};

