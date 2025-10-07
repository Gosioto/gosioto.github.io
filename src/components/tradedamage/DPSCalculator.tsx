'use client';

import { useState } from 'react';
import { Unit, SquadUnit, Squad, Scroll, Badge, Food } from '@/types/tradedamage';
import { units, scrolls, badges, food } from '@/data/tradedamage';
import { calculateSquadStats, calculateUnitDPS, calculateUnitHealth, calculateUnitDamage } from '@/utils/tradedamage';

export default function DPSCalculator() {
  const [squad, setSquad] = useState<Squad>({
    units: [null, null, null, null], // 4 slots for mercenaries (positions 2-5)
    transport: null
  });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedSquadUnit, setSelectedSquadUnit] = useState<SquadUnit | null>(null);
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customizationUnit, setCustomizationUnit] = useState<SquadUnit | null>(null);
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
      setSquad(prev => ({ ...prev, transport: { unit, scrolls: [], badges: [] } }));
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

  const addScrollToUnit = (unitIndex: number, scroll: Scroll) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      if (newUnits[unitIndex] && newUnits[unitIndex]!.scrolls.length < 2) {
        newUnits[unitIndex]!.scrolls.push(scroll);
      }
      return { ...prev, units: newUnits };
    });
  };

  const addBadgeToUnit = (unitIndex: number, badge: Badge) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      if (newUnits[unitIndex] && newUnits[unitIndex]!.badges.length < 3) {
        newUnits[unitIndex]!.badges.push(badge);
      }
      return { ...prev, units: newUnits };
    });
  };

  const addFoodToUnit = (unitIndex: number, foodItem: Food) => {
    setSquad(prev => {
      const newUnits = [...prev.units];
      if (newUnits[unitIndex]) {
        newUnits[unitIndex]!.food = foodItem;
      }
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
            </div>
          </div>
          
          <div className="units-grid">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id} 
                className="unit-card"
                onClick={() => addUnitToSquad(unit)}
              >
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

        {/* Right side - Active squad */}
        <div className="squad-panel">
          <div className="panel-header">
            <h3>Активный отряд</h3>
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
                      className={`squad-unit-card ${selectedSquadUnit?.unit.id === squad.units[index]?.unit.id ? 'active' : ''}`}
                      onClick={() => {
                        if (selectedSquadUnit?.unit.id === squad.units[index]?.unit.id) {
                          setSelectedSquadUnit(null);
                          setShowUnitDetails(false);
                        } else {
                          setSelectedSquadUnit(squad.units[index]!);
                          setShowUnitDetails(true);
                        }
                      }}
                    >
                      <img src={squad.units[index]!.unit.icon} alt={squad.units[index]!.unit.name} />
                    </div>
                    <div className="unit-actions">
                      <button 
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUnitFromSquad(index);
                          if (selectedSquadUnit?.unit.id === squad.units[index]?.unit.id) {
                            setSelectedSquadUnit(null);
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
                          setCustomizationUnit(squad.units[index]!);
                          setShowCustomizationModal(true);
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
                    className={`squad-unit-card ${selectedSquadUnit?.unit.id === squad.transport.unit.id ? 'active' : ''}`}
                    onClick={() => setSelectedSquadUnit(squad.transport)}
                  >
                    <img src={squad.transport.unit.icon} alt={squad.transport.unit.name} />
                  </div>
                  <div className="unit-actions">
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTransport();
                        if (selectedSquadUnit?.unit.id === squad.transport?.unit.id) {
                          setSelectedSquadUnit(null);
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
                        setSelectedSquadUnit(squad.transport);
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

          {/* Selected unit info */}
          {selectedSquadUnit && (
            <div className="unit-info">
              <h4>{selectedSquadUnit.unit.name}</h4>
              <div className="unit-details">
                <p><strong>Тип:</strong> {selectedSquadUnit.unit.type === 'melee' ? 'Ближний бой' : 'Дальний бой'}</p>
                <p><strong>Уровень:</strong> {selectedSquadUnit.unit.level}/{selectedSquadUnit.unit.maxLevel}</p>
                <p><strong>Стоимость:</strong> {selectedSquadUnit.unit.cost} монет</p>
                <div className="unit-modifiers">
                  <div className="scrolls">
                    <h5>Свитки:</h5>
                    {selectedSquadUnit.scrolls.map((scroll, i) => (
                      <span key={i} className="modifier scroll">{scroll.name}</span>
                    ))}
                  </div>
                  <div className="badges">
                    <h5>Значки:</h5>
                    {selectedSquadUnit.badges.map((badge, i) => (
                      <span key={i} className="modifier badge">{badge.name}</span>
                    ))}
                  </div>
                  <div className="food">
                    <h5>Еда:</h5>
                    {selectedSquadUnit.food && (
                      <span className="modifier food">{selectedSquadUnit.food.name}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (selectedSquadUnit.unit.category === 'transport') {
                      removeTransport();
                    } else {
                      const index = squad.units.findIndex(u => u && u.unit.id === selectedSquadUnit.unit.id);
                      if (index !== -1) removeUnitFromSquad(index);
                    }
                    setSelectedSquadUnit(null);
                  }} 
                  className="remove-btn"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}

          {/* Squad stats */}
          <div className="squad-stats">
            <h4>Статистика отряда</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/урон.png" alt="DPS" />
                  DPS отряда
                </span>
                <span className="stat-value">{squadStats.totalDPS}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/урон.png" alt="DPS с критом" />
                  DPS с учетом среднего крита
                </span>
                <span className="stat-value">{squadStats.totalDamageWithCrits}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/крит шанс.png" alt="DPS критов" />
                  DPS критов
                </span>
                <span className="stat-value">{squadStats.totalDamageWithCrits - squadStats.totalDamage}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/здоровье.png" alt="Среднее HP" />
                  Средний показатель жизней
                </span>
                <span className="stat-value">{Math.round(squadStats.totalHealth / squad.units.filter(u => u).length)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <img src="/TradeDamage/ui/сила крита.png" alt="Коэф силы" />
                  Коэф силы
                </span>
                <span className="stat-value">{squadStats.averageCritDamage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Details Modal */}
      {showUnitDetails && selectedSquadUnit && (
        <div className="unit-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedSquadUnit.unit.name}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowUnitDetails(false);
                  setSelectedSquadUnit(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="unit-details-content">
              <div className="unit-avatar">
                <img src={selectedSquadUnit.unit.icon} alt={selectedSquadUnit.unit.name} />
              </div>
              <div className="unit-stats-detailed">
                <div className="stat-item">
                  <span className="stat-label">
                    <img src="/TradeDamage/ui/здоровье.png" alt="Здоровье" />
                    Здоровье
                  </span>
                  <span className="stat-value">{calculateUnitHealth(selectedSquadUnit)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">
                    <img src="/TradeDamage/ui/урон.png" alt="Урон" />
                    Урон
                  </span>
                  <span className="stat-value">{calculateUnitDamage(selectedSquadUnit)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">
                    <img src="/TradeDamage/ui/урон.png" alt="DPS" />
                    Урон в сек
                  </span>
                  <span className="stat-value">{calculateUnitDPS(selectedSquadUnit)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Скорость атаки</span>
                  <span className="stat-value">{selectedSquadUnit.unit.attackSpeed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">
                    <img src="/TradeDamage/ui/крит шанс.png" alt="Крит шанс" />
                    Крит шанс
                  </span>
                  <span className="stat-value">{selectedSquadUnit.unit.critChance}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">
                    <img src="/TradeDamage/ui/сила крита.png" alt="Сила крита" />
                    Сила крита
                  </span>
                  <span className="stat-value">x{selectedSquadUnit.unit.critDamage}</span>
                </div>
              </div>
              <div className="unit-enhancements">
                <h4>Примененные усиления:</h4>
                <div className="enhancement-list">
                  {selectedSquadUnit.scrolls.length > 0 && (
                    <div className="enhancement-category">
                      <h5>Свитки:</h5>
                      {selectedSquadUnit.scrolls.map((scroll, index) => (
                        <div key={index} className="enhancement-item">
                          <img src={scroll.icon} alt={scroll.name} />
                          <span>{scroll.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedSquadUnit.badges.length > 0 && (
                    <div className="enhancement-category">
                      <h5>Значки:</h5>
                      {selectedSquadUnit.badges.map((badge, index) => (
                        <div key={index} className="enhancement-item">
                          <img src={badge.icon} alt={badge.name} />
                          <span>{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && customizationUnit && (
        <div className="customization-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Кастомизация: {customizationUnit.unit.name}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCustomizationModal(false);
                  setCustomizationUnit(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="customization-content">
              <div className="customization-slots">
                {Array.from({ length: 10 }, (_, index) => (
                  <div key={index} className="customization-slot">
                    <span className="slot-number">{index + 1}</span>
                    <div className="slot-content">
                      {/* Placeholder for customization options */}
                      <div className="customization-options">
                        <button className="customization-btn">
                          <img src="/TradeDamage/ui/урон.png" alt="Урон" />
                        </button>
                        <button className="customization-btn">
                          <img src="/TradeDamage/ui/крит шанс.png" alt="Крит шанс" />
                        </button>
                        <button className="customization-btn">
                          <img src="/TradeDamage/ui/сила крита.png" alt="Сила крита" />
                        </button>
                        <button className="customization-btn">
                          <img src="/TradeDamage/ui/здоровье.png" alt="Здоровье" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
