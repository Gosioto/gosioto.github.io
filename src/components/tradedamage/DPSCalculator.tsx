'use client';

import { useState } from 'react';
import { Unit, SquadUnit, Squad, Scroll, Badge, Food } from '@/types/tradedamage';
import { units, scrolls, badges, food } from '@/data/tradedamage';
import { calculateSquadStats, calculateUnitDPS, calculateUnitHealth, calculateUnitDamage } from '@/utils/tradedamage';

export default function DPSCalculator() {
  const [squad, setSquad] = useState<Squad>({
    units: [],
    transport: null
  });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedSquadUnit, setSelectedSquadUnit] = useState<SquadUnit | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'melee' | 'ranged' | 'all',
    category: 'all' as 'mercenary' | 'transport' | 'all',
    rarity: 'all'
  });

  const filteredUnits = units.filter(unit => {
    if (filters.type !== 'all' && unit.type !== filters.type) return false;
    if (filters.category !== 'all' && unit.category !== filters.category) return false;
    if (filters.rarity !== 'all' && unit.rarity !== filters.rarity) return false;
    return true;
  });

  const addUnitToSquad = (unit: Unit) => {
    if (unit.category === 'transport') {
      setSquad(prev => ({ ...prev, transport: { unit, scrolls: [], badges: [] } }));
    } else if (squad.units.length < 4) {
      const newSquadUnit: SquadUnit = { unit, scrolls: [], badges: [] };
      setSquad(prev => ({ ...prev, units: [...prev.units, newSquadUnit] }));
    }
  };

  const removeUnitFromSquad = (index: number) => {
    setSquad(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }));
  };

  const removeTransport = () => {
    setSquad(prev => ({ ...prev, transport: null }));
  };

  const addScrollToUnit = (unitIndex: number, scroll: Scroll) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      if (newUnits[unitIndex].scrolls.length < 2) {
        newUnits[unitIndex].scrolls.push(scroll);
      }
      return { ...prev, units: newUnits };
    });
  };

  const addBadgeToUnit = (unitIndex: number, badge: Badge) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      if (newUnits[unitIndex].badges.length < 3) {
        newUnits[unitIndex].badges.push(badge);
      }
      return { ...prev, units: newUnits };
    });
  };

  const addFoodToUnit = (unitIndex: number, foodItem: Food) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      newUnits[unitIndex].food = foodItem;
      return { ...prev, units: newUnits };
    });
  };

  const squadStats = calculateSquadStats(squad);

  return (
    <div className="dps-calculator">
      <div className="calculator-grid">
        {/* Left side - Units list */}
        <div className="units-panel">
          <div className="panel-header">
            <h3>Наемники для найма</h3>
            <div className="filters">
              <select 
                value={filters.type} 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="all">Все типы</option>
                <option value="melee">Ближний бой</option>
                <option value="ranged">Дальний бой</option>
              </select>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="all">Все категории</option>
                <option value="mercenary">Наемники</option>
                <option value="transport">Транспорт</option>
              </select>
              <select 
                value={filters.rarity} 
                onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
              >
                <option value="all">Все редкости</option>
                <option value="common">Обычный</option>
                <option value="uncommon">Необычный</option>
                <option value="rare">Редкий</option>
                <option value="epic">Эпический</option>
                <option value="legendary">Легендарный</option>
              </select>
            </div>
          </div>
          
          <div className="units-grid">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id} 
                className={`unit-card ${unit.rarity}`}
                onClick={() => addUnitToSquad(unit)}
              >
                <img src={unit.icon} alt={unit.name} className="unit-icon" />
                <div className="unit-info">
                  <h4>{unit.name}</h4>
                  <p className="unit-type">{unit.type === 'melee' ? 'Ближний бой' : 'Дальний бой'}</p>
                  <p className="unit-rarity">{unit.rarity}</p>
                  <div className="unit-stats">
                    <span>❤️ {unit.health}</span>
                    <span>⚔️ {unit.damage}</span>
                    <span>⚡ {unit.attackSpeed}</span>
                  </div>
                  <p className="unit-cost">💰 {unit.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Active squad */}
        <div className="squad-panel">
          <div className="panel-header">
            <h3>Активный отряд</h3>
          </div>

          {/* Transport slot */}
          <div className="transport-slot">
            <h4>Транспорт (1)</h4>
            {squad.transport ? (
              <div className="squad-unit-card">
                <img src={squad.transport.unit.icon} alt={squad.transport.unit.name} />
                <div className="unit-details">
                  <h5>{squad.transport.unit.name}</h5>
                  <div className="unit-stats">
                    <span>❤️ {calculateUnitHealth(squad.transport)}</span>
                    <span>⚔️ {calculateUnitDamage(squad.transport)}</span>
                    <span>💥 {calculateUnitDPS(squad.transport).toFixed(1)} DPS</span>
                  </div>
                  <button onClick={removeTransport} className="remove-btn">Удалить</button>
                </div>
              </div>
            ) : (
              <div className="empty-slot">Пустой слот</div>
            )}
          </div>

          {/* Mercenary slots */}
          <div className="mercenary-slots">
            <h4>Наемники (2-5)</h4>
            <div className="squad-units">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="squad-unit-slot">
                  <span className="slot-number">{index + 2}</span>
                  {squad.units[index] ? (
                    <div className="squad-unit-card">
                      <img src={squad.units[index].unit.icon} alt={squad.units[index].unit.name} />
                      <div className="unit-details">
                        <h5>{squad.units[index].unit.name}</h5>
                        <div className="unit-stats">
                          <span>❤️ {calculateUnitHealth(squad.units[index])}</span>
                          <span>⚔️ {calculateUnitDamage(squad.units[index])}</span>
                          <span>💥 {calculateUnitDPS(squad.units[index]).toFixed(1)} DPS</span>
                        </div>
                        <div className="unit-modifiers">
                          <div className="scrolls">
                            {squad.units[index].scrolls.map((scroll, i) => (
                              <span key={i} className="modifier scroll">📜 {scroll.name}</span>
                            ))}
                          </div>
                          <div className="badges">
                            {squad.units[index].badges.map((badge, i) => (
                              <span key={i} className="modifier badge">🏅 {badge.name}</span>
                            ))}
                          </div>
                          {squad.units[index].food && (
                            <span className="modifier food">🍖 {squad.units[index].food!.name}</span>
                          )}
                        </div>
                        <button onClick={() => removeUnitFromSquad(index)} className="remove-btn">Удалить</button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-slot">Пустой слот</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Squad statistics */}
          <div className="squad-stats">
            <h4>Статистика отряда</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Общий DPS:</span>
                <span className="stat-value">{squadStats.totalDPS}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Общее здоровье:</span>
                <span className="stat-value">{squadStats.totalHealth}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Урон без критов:</span>
                <span className="stat-value">{squadStats.totalDamage}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Урон с макс критами:</span>
                <span className="stat-value">{squadStats.totalDamageWithCrits}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Средний шанс крита:</span>
                <span className="stat-value">{squadStats.averageCritChance}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Средняя сила крита:</span>
                <span className="stat-value">x{squadStats.averageCritDamage}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Общая стоимость:</span>
                <span className="stat-value">💰 {squadStats.totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
