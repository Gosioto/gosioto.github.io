'use client';

import { useState, useMemo } from 'react';
import { Unit, SquadUnit, Squad } from '@/types/tradedamage';
import { units } from '@/data/tradedamage';
import { calculateSquadStats } from '@/utils/tradedamage';

export default function SquadBuilder() {
  const [budget, setBudget] = useState(1000);
  const [squad, setSquad] = useState<Squad>({
    units: [null, null, null, null], // 4 slots for mercenaries (positions 2-5)
    transport: null
  });
  const [filters, setFilters] = useState({
    type: 'all' as 'melee' | 'ranged' | 'all',
    category: 'all' as 'mercenary' | 'transport' | 'all',
    rarity: 'all'
  });

  const filteredUnits = units.filter(unit => {
    if (filters.type !== 'all' && unit.type !== filters.type) return false;
    if (filters.category !== 'all' && unit.category !== filters.category) return false;
    return true;
  });

  const addUnitToSquad = (unit: Unit) => {
    if (unit.category === 'transport') {
      if (!squad.transport) {
        setSquad(prev => ({ ...prev, transport: { unit, scrolls: [], badges: [] } }));
      }
    } else {
      // Find first empty slot (positions 2-5)
      setSquad(prev => {
        const emptySlotIndex = prev.units.findIndex(squadUnit => squadUnit === null);
        if (emptySlotIndex !== -1) {
          const newSquadUnit: SquadUnit = { unit, scrolls: [], badges: [] };
          const newUnits = [...prev.units];
          newUnits[emptySlotIndex] = newSquadUnit;
          return { ...prev, units: newUnits };
        }
        return prev;
      });
    }
  };

  const removeUnitFromSquad = (index: number) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      newUnits[index] = null; // Set to null instead of removing
      return { ...prev, units: newUnits };
    });
  };

  const removeTransport = () => {
    setSquad(prev => ({ ...prev, transport: null }));
  };

  const squadStats = calculateSquadStats(squad);
  const remainingBudget = budget - squadStats.totalCost;

  const autoFillSquad = () => {
    const newSquad: Squad = { units: [], transport: null };
    let remainingBudget = budget;

    // Сначала добавляем транспорт
    const transports = filteredUnits.filter(u => u.category === 'transport');
    const cheapestTransport = transports.reduce((cheapest, current) => 
      current.cost < cheapest.cost ? current : cheapest, transports[0]
    );
    
    if (cheapestTransport && remainingBudget >= cheapestTransport.cost) {
      newSquad.transport = { unit: cheapestTransport, scrolls: [], badges: [] };
      remainingBudget -= cheapestTransport.cost;
    }

    // Затем добавляем наемников
    const mercenaries = filteredUnits.filter(u => u.category === 'mercenary');
    const sortedMercenaries = mercenaries.sort((a, b) => b.damage * b.attackSpeed - a.damage * a.attackSpeed);

    for (const mercenary of sortedMercenaries) {
      if (newSquad.units.length < 4 && remainingBudget >= mercenary.cost) {
        newSquad.units.push({ unit: mercenary, scrolls: [], badges: [] });
        remainingBudget -= mercenary.cost;
      }
    }

    setSquad(newSquad);
  };

  const clearSquad = () => {
    setSquad({ units: [], transport: null });
  };

  return (
    <div className="squad-builder">
      <div className="builder-grid">
        {/* Left side - Budget and Units */}
        <div className="units-panel">
          <div className="panel-header">
            <h3>Подбор отряда под бюджет</h3>
            <div className="budget-controls">
              <label htmlFor="budget">Бюджет:</label>
              <input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min="100"
                max="5000"
                step="100"
                className="budget-input"
              />
              <span className="budget-currency">монет</span>
            </div>
            <div className="budget-actions">
              <button onClick={autoFillSquad} className="action-btn primary">
                Автозаполнение
              </button>
              <button onClick={clearSquad} className="action-btn secondary">
                Очистить
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
            </div>
          </div>
          <div className="units-grid">
            {filteredUnits.map(unit => (
              <div key={unit.id} className="unit-card" onClick={() => addUnitToSquad(unit)}>
                <img src={unit.icon} alt={unit.name} className="unit-icon" />
                <div className="unit-info">
                  <h4>{unit.name}</h4>
                  <div className="unit-stats">
                    <div className="stat-row">
                      <span className="stat-label">Уникальность:</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ width: `${unit.uniqueness}%` }}
                        ></div>
                      </div>
                      <span className="stat-value">{unit.uniqueness}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Мощь:</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ width: `${unit.power}%` }}
                        ></div>
                      </div>
                      <span className="stat-value">{unit.power}</span>
                    </div>
                    <div className="unit-specialty">
                      <span className="specialty-label">Специализация:</span>
                      <span className="specialty-value">{unit.specialty}</span>
                    </div>
                    <div className="unit-enhancement">
                      <span className="enhancement-label">Усиление:</span>
                      <span className="enhancement-value">{unit.enhancement}</span>
                    </div>
                  </div>
                  <div className="unit-cost">
                    <img src="/TradeDamage/ui/Мешок с деньгами.png" alt="Стоимость" style={{width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle'}} />
                    {unit.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Squad and Budget Info */}
        <div className="squad-panel">
          <div className="panel-header">
            <h3>Собранный отряд</h3>
            <div className="budget-info">
              <div className="budget-item">
                <span className="budget-label">Бюджет:</span>
                <span className="budget-value">{budget}</span>
              </div>
              <div className="budget-item">
                <span className="budget-label">Потрачено:</span>
                <span className="budget-value spent">{squadStats.totalCost}</span>
              </div>
              <div className="budget-item">
                <span className="budget-label">Остаток:</span>
                <span className={`budget-value ${remainingBudget >= 0 ? 'remaining' : 'overbudget'}`}>
                  {remainingBudget}
                </span>
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
                    <div className="squad-unit-card">
                      <img src={squad.units[index]!.unit.icon} alt={squad.units[index]!.unit.name} />
                    </div>
                    <div className="unit-actions">
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => removeUnitFromSquad(index)}
                        title="Удалить наемника"
                      >
                        <img src="/TradeDamage/ui/UI_button/icon_delete.png" alt="Удалить" />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => {/* TODO: Add edit functionality */}}
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
                  <div className="squad-unit-card">
                    <img src={squad.transport.unit.icon} alt={squad.transport.unit.name} />
                  </div>
                  <div className="unit-actions">
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => removeTransport()}
                      title="Удалить транспорт"
                    >
                      <img src="/TradeDamage/ui/UI_button/icon_delete.png" alt="Удалить" />
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => {/* TODO: Add edit functionality */}}
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

          {/* Squad stats */}
          <div className="squad-stats">
            <h4>Статистика отряда</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/урон.png" alt="Урон" />
                  Общий DPS
                </span>
                <span className="stat-value">{squadStats.totalDPS}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/здоровье.png" alt="Здоровье" />
                  Общее здоровье
                </span>
                <span className="stat-value">{squadStats.totalHealth}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/уровень.png" alt="Уровень" />
                  Общая стоимость
                </span>
                <span className="stat-value">{squadStats.totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
