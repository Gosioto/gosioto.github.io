'use client';

import { useState, useMemo } from 'react';
import { Unit, SquadUnit, Squad, Scroll, Badge, Food } from '@/types/tradedamage';
import { units, scrolls, badges, food } from '@/data/tradedamage';
import { calculateSquadStats } from '@/utils/tradedamage';

export default function Sandbox() {
  const [squad, setSquad] = useState<Squad>({
    units: [],
    transport: null
  });
  const [selectedUnit, setSelectedUnit] = useState<SquadUnit | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'melee' | 'ranged' | 'all',
    category: 'all' as 'mercenary' | 'transport' | 'all',
    rarity: 'all'
  });
  const [simulationMode, setSimulationMode] = useState(false);

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const typeMatch = filters.type === 'all' || unit.type === filters.type;
      const categoryMatch = filters.category === 'all' || unit.category === filters.category;
      const rarityMatch = filters.rarity === 'all' || unit.rarity === filters.rarity;
      return typeMatch && categoryMatch && rarityMatch;
    });
  }, [filters]);

  const addUnitToSquad = (unit: Unit) => {
    if (unit.category === 'transport') {
      if (!squad.transport) {
        setSquad(prev => ({ ...prev, transport: { unit, scrolls: [], badges: [] } }));
      }
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

  const simulateBattle = () => {
    // Простая симуляция боя
    const enemySquad = {
      totalDPS: 150,
      totalHealth: 800
    };

    const ourDPS = squadStats.totalDPS;
    const ourHealth = squadStats.totalHealth;

    const timeToKillEnemy = enemySquad.totalHealth / ourDPS;
    const timeToKillUs = ourHealth / enemySquad.totalDPS;

    if (timeToKillEnemy < timeToKillUs) {
      alert(`Победа! Время боя: ${timeToKillEnemy.toFixed(1)} секунд`);
    } else {
      alert(`Поражение! Время боя: ${timeToKillUs.toFixed(1)} секунд`);
    }
  };

  const resetSquad = () => {
    setSquad({ units: [], transport: null });
    setSelectedUnit(null);
  };

  return (
    <div className="sandbox">
      <div className="sandbox-grid">
        {/* Left side - Units */}
        <div className="units-panel">
          <div className="panel-header">
            <h3>Песочница - Эксперименты</h3>
            <div className="sandbox-controls">
              <button 
                onClick={simulateBattle} 
                className="action-btn primary"
                disabled={squad.units.length === 0 && !squad.transport}
              >
                Симуляция боя
              </button>
              <button onClick={resetSquad} className="action-btn secondary">
                Сброс
              </button>
            </div>
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
                <option value="all">Вся редкость</option>
                <option value="common">Обычный</option>
                <option value="uncommon">Необычный</option>
                <option value="rare">Редкий</option>
                <option value="epic">Эпический</option>
                <option value="legendary">Легендарный</option>
              </select>
            </div>
          </div>
          <div className="units-grid">
            {filteredUnits.map(unit => (
              <div key={unit.id} className={`unit-card ${unit.rarity}`} onClick={() => addUnitToSquad(unit)}>
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
                  <p className="unit-cost">
                    <img src="/TradeDamage/ui/Мешок с деньгами.png" alt="Стоимость" style={{width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle'}} />
                    {unit.cost}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Squad and Experiments */}
        <div className="squad-panel">
          <div className="panel-header">
            <h3>Экспериментальный отряд</h3>
            <div className="simulation-info">
              <div className="simulation-stats">
                <div className="stat-item">
                  <span className="stat-label">Общий DPS:</span>
                  <span className="stat-value">{squadStats.totalDPS}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Общее здоровье:</span>
                  <span className="stat-value">{squadStats.totalHealth}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Общая стоимость:</span>
                  <span className="stat-value">{squadStats.totalCost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Squad units in 5 columns - order: 5-4-3-2-1 (1=transport, 2-5=mercenaries) */}
          <div className="squad-units">
            {/* Mercenary slots (positions 5-4-3-2) */}
            {[3, 2, 1, 0].map((index) => (
              <div key={index} className="squad-unit-slot">
                <span className="slot-number">{index + 2}</span>
                {squad.units[index] ? (
                  <div className="squad-unit-container">
                    <div 
                      className={`squad-unit-card ${selectedUnit?.unit.id === squad.units[index].unit.id ? 'active' : ''}`}
                      onClick={() => setSelectedUnit(squad.units[index])}
                    >
                      <img src={squad.units[index].unit.icon} alt={squad.units[index].unit.name} />
                    </div>
                    <div className="unit-actions">
                      <button 
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUnitFromSquad(index);
                          if (selectedUnit?.unit.id === squad.units[index].unit.id) {
                            setSelectedUnit(null);
                          }
                        }}
                        title="Удалить наемника"
                      >
                        <img src="/TradeDamage/ui/UI_button/icon_delete.png" alt="Удалить" />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnit(squad.units[index]);
                        }}
                        title="Редактировать наемника"
                      >
                        <img src="/TradeDamage/ui/UI_button/icon_allow.png" alt="Редактировать" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-slot">Пустой слот</div>
                )}
              </div>
            ))}

            {/* Transport slot (position 1) - rightmost */}
            <div className="squad-unit-slot">
              <span className="slot-number">1</span>
              {squad.transport ? (
                <div className="squad-unit-container">
                  <div 
                    className={`squad-unit-card ${selectedUnit?.unit.id === squad.transport.unit.id ? 'active' : ''}`}
                    onClick={() => setSelectedUnit(squad.transport)}
                  >
                    <img src={squad.transport.unit.icon} alt={squad.transport.unit.name} />
                  </div>
                  <div className="unit-actions">
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTransport();
                        if (selectedUnit?.unit.id === squad.transport?.unit.id) {
                          setSelectedUnit(null);
                        }
                      }}
                      title="Удалить транспорт"
                    >
                      <img src="/TradeDamage/ui/UI_button/icon_delete.png" alt="Удалить" />
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUnit(squad.transport);
                      }}
                      title="Редактировать транспорт"
                    >
                      <img src="/TradeDamage/ui/UI_button/icon_allow.png" alt="Редактировать" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-slot">Пустой слот</div>
              )}
            </div>
          </div>

          {/* Selected unit modifications */}
          {selectedUnit && (
            <div className="unit-modifications">
              <h4>Модификации для {selectedUnit.unit.name}</h4>
              
              {/* Scrolls */}
              <div className="modification-section">
                <h5>Свитки (макс. 2):</h5>
                <div className="modification-items">
                  {scrolls.map(scroll => (
                    <div key={scroll.id} className="modification-item" onClick={() => {
                      const unitIndex = squad.units.findIndex(u => u.unit.id === selectedUnit.unit.id);
                      if (unitIndex !== -1) addScrollToUnit(unitIndex, scroll);
                    }}>
                      <img src={scroll.icon} alt={scroll.name} />
                      <span>{scroll.name}</span>
                      <span className="modification-cost">{scroll.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="modification-section">
                <h5>Значки (макс. 3):</h5>
                <div className="modification-items">
                  {badges.map(badge => (
                    <div key={badge.id} className="modification-item" onClick={() => {
                      const unitIndex = squad.units.findIndex(u => u.unit.id === selectedUnit.unit.id);
                      if (unitIndex !== -1) addBadgeToUnit(unitIndex, badge);
                    }}>
                      <img src={badge.icon} alt={badge.name} />
                      <span>{badge.name}</span>
                      <span className="modification-cost">{badge.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food */}
              <div className="modification-section">
                <h5>Еда:</h5>
                <div className="modification-items">
                  {food.map(foodItem => (
                    <div key={foodItem.id} className="modification-item" onClick={() => {
                      const unitIndex = squad.units.findIndex(u => u.unit.id === selectedUnit.unit.id);
                      if (unitIndex !== -1) addFoodToUnit(unitIndex, foodItem);
                    }}>
                      <img src={foodItem.icon} alt={foodItem.name} />
                      <span>{foodItem.name}</span>
                      <span className="modification-cost">{foodItem.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
