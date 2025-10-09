'use client';

import { useState } from 'react';
import { Unit } from '@/types/tradedamage';
import UnitDetailsModal from './UnitDetailsModal';
import UnitEditModal from './UnitEditModal';

interface EnhancedUnitCardProps {
  unit: Unit;
  onClick: (unit: Unit) => void;
}

export default function EnhancedUnitCard({ unit, onClick }: EnhancedUnitCardProps) {
  const [isInfoHovered, setIsInfoHovered] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getRarityColor = (level: number) => {
    if (level >= 10) return '#ffd700'; // Легендарный - желто-оранжевый
    if (level >= 8) return '#9f7aea'; // Эпический - фиолетовый
    if (level >= 6) return '#60a5fa'; // Редкий - сине-голубой
    if (level >= 4) return '#4ade80'; // Необычный - зеленый
    return '#d2691e'; // Обычный - коричнево-оранжевый
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'танк': return '#4ade80';
      case 'урон': return '#f87171';
      case 'криты': return '#fbbf24';
      case 'яд': return '#a78bfa';
      case 'оглушение': return '#60a5fa';
      default: return '#94a3b8';
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailsOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleSaveEdit = (updatedUnit: any) => {
    // Здесь можно добавить логику сохранения изменений
    console.log('Updated unit:', updatedUnit);
  };

  return (
    <div
      className="enhanced-unit-card"
      onClick={() => onClick(unit)}
      style={{
        '--rarity-color': getRarityColor(unit.level),
        '--specialty-color': getSpecialtyColor(unit.specialty),
      } as React.CSSProperties}
    >
      {/* Основная карточка */}
      <div className="card-main">
         {/* Заголовок с редкостью - убран уровень, так как он отображается на иконке */}
         <div className="card-header">
           <div className="rarity-indicator" />
         </div>

        {/* Иконка наемника */}
        <div className="unit-icon-container">
          <img 
            src={unit.icon} 
            alt={unit.name}
            className="unit-icon"
          />
          <div className="type-badge">
            <img 
              src={unit.type === 'melee' ? '/TradeDamage/ui/s_gui_mercenaries_ability52.png' : '/TradeDamage/ui/s_gui_mercenaries_ability47.png'} 
              alt={unit.type === 'melee' ? 'Ближний бой' : 'Дальний бой'}
              className="type-icon"
            />
          </div>
        </div>

         {/* Информация о наемнике */}
         <div 
           className="unit-info"
           onMouseEnter={() => setIsInfoHovered(true)}
           onMouseLeave={() => setIsInfoHovered(false)}
         >
          <h4 className="unit-name">{unit.name}</h4>
          
          {/* Статистики */}
          <div className="unit-stats">
            <div className="stat-row">
              <span className="stat-label">Уникальность:</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${unit.uniqueness}%` }}
                />
              </div>
              <span className="stat-value">{unit.uniqueness}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Мощь:</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${unit.power}%` }}
                />
              </div>
              <span className="stat-value">{unit.power}</span>
            </div>
          </div>

          {/* Специальность и роль */}
          <div className="specialty-badge">
            <span className="specialty-text">{unit.specialty}</span>
          </div>
          {unit.role && unit.role.toLowerCase() !== unit.specialty && (
            <div className="role-badge">
              <span className="role-text">{unit.role}</span>
            </div>
          )}
          {unit.damageType && unit.damageType.toLowerCase() !== unit.specialty && (
            <div className="damage-type-badge">
              <span className="damage-type-text">{unit.damageType}</span>
            </div>
          )}

          {/* Стоимость */}
          <div className="unit-cost">
            <img src="/TradeDamage/ui/s_gui_map_legend_goods.png" alt="Стоимость" className="cost-icon" />
            {unit.cost}
          </div>
        </div>
      </div>

       {/* Hover-панель с детальной информацией */}
       {isInfoHovered && (
        <div className="card-hover-panel">
           <div className="hover-header">
             <h4>{unit.name}</h4>
             {/* Уровень убран - он отображается на иконке */}
           </div>

          {/* Основные характеристики */}
          <div className="stats-section">
            <h5>Характеристики</h5>
            <div className="stat-row">
              <span className="stat-label">
                <img src="/TradeDamage/ui/s_gui_icon_buff_health.png" alt="Здоровье" className="stat-icon" />
                Здоровье
              </span>
              <span className="stat-value">{unit.health}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">
                <img src="/TradeDamage/ui/s_gui_icon_buff_damage.png" alt="Урон" className="stat-icon" />
                Урон
              </span>
              <span className="stat-value">{unit.damage}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">
                <img src="/TradeDamage/ui/s_gui_icon_buff_atkspeed.png" alt="Скорость атаки" className="stat-icon" />
                Скорость атаки
              </span>
              <span className="stat-value">{unit.attackSpeed}s</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">
                <img src="/TradeDamage/ui/s_gui_icon_buff_crtchance.png" alt="Крит шанс" className="stat-icon" />
                Крит шанс
              </span>
              <span className="stat-value">{unit.critChance}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">
                <img src="/TradeDamage/ui/s_gui_button_battlestatistics.png" alt="Крит урон" className="stat-icon" />
                Крит урон
              </span>
              <span className="stat-value">x{unit.critDamage}</span>
            </div>
          </div>

          {/* Способности */}
          <div className="skills-section">
            <h5>Способности</h5>
            <div className="skill-item">
              <span className="skill-name">{unit.skill1}</span>
            </div>
            <div className="skill-item">
              <span className="skill-name">{unit.skill2}</span>
            </div>
          </div>

          {/* Описание */}
          <div className="description-section">
            <p className="unit-description">{unit.description}</p>
          </div>

          {/* Усиление */}
          <div className="enhancement-section">
            <h5>
              <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Усиление" className="section-icon" />
              Усиление
            </h5>
            <p className="enhancement-text">{unit.enhancement}</p>
          </div>

           {/* Уникальность */}
           <div className="uniqueness-section">
             <div className="uniqueness-bar">
               <div className="uniqueness-label">Уникальность</div>
               <div className="uniqueness-progress">
                 <div 
                   className="uniqueness-fill" 
                   style={{ width: `${unit.uniqueness}%` }}
                 />
               </div>
               <div className="uniqueness-value">{unit.uniqueness}%</div>
             </div>
             <div className="power-bar">
               <div className="power-label">Мощь</div>
               <div className="power-progress">
                 <div 
                   className="power-fill" 
                   style={{ width: `${unit.power}%` }}
                 />
               </div>
               <div className="power-value">{unit.power}%</div>
             </div>
           </div>

           {/* Кнопки действий в hover-панели */}
           <div className="hover-actions">
             <button 
               className="action-btn details-btn" 
               onClick={handleDetailsClick}
               title="Просмотр характеристик"
             >
               <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Информация" className="action-icon" />
             </button>
             <button 
               className="action-btn edit-btn" 
               onClick={handleEditClick}
               title="Настройка наемника"
             >
               <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Редактировать" className="action-icon" />
             </button>
           </div>
        </div>
      )}

       {/* Кнопки действий убраны - hover эффект теперь срабатывает только при наведении на unit-info */}

       {/* Модальные окна */}
       <UnitDetailsModal 
         unit={unit} 
         isOpen={isDetailsOpen} 
         onClose={() => setIsDetailsOpen(false)} 
       />
       <UnitEditModal 
         unit={unit} 
         isOpen={isEditOpen} 
         onClose={() => setIsEditOpen(false)}
         onSave={handleSaveEdit}
       />
    </div>
  );
}