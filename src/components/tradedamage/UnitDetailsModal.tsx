'use client';

import React from 'react';
import { Unit } from '@/types/tradedamage';

interface UnitDetailsModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
}

export default function UnitDetailsModal({ unit, isOpen, onClose }: UnitDetailsModalProps) {
  if (!isOpen) return null;

  const getRarityColor = (level: number) => {
    if (level >= 10) return '#ff6b35'; // Легендарный - оранжевый
    if (level >= 8) return '#9f7aea'; // Эпический - фиолетовый
    if (level >= 6) return '#3182ce'; // Редкий - синий
    if (level >= 4) return '#38a169'; // Необычный - зеленый
    return '#718096'; // Обычный - серый
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'танк': return '#4ade80';
      case 'урон': return '#f87171';
      case 'криты': return '#fbbf24';
      case 'яд': return '#a78bfa';
      case 'оглушение': return '#60a5fa';
      case 'кровотечение': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const rarityColor = getRarityColor(unit.level);
  const specialtyColor = getSpecialtyColor(unit.specialty);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="modal-header">
          <div className="unit-header-info">
            <img src={unit.icon} alt={unit.name} className="modal-unit-icon" />
            <div className="unit-title">
              <h2 className="unit-name">{unit.name}</h2>
              <div className="unit-level-badge" style={{ '--rarity-color': rarityColor } as React.CSSProperties}>
                <img src="/TradeDamage/ui/s_gui_mercenaries_merclevel.png" alt="Уровень" className="level-icon" />
                Уровень {unit.level}/{unit.maxLevel}
              </div>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <img src="/TradeDamage/ui/s_gui_dialog_button_exit.png" alt="Закрыть" className="close-icon" />
          </button>
        </div>

        {/* Основная информация */}
        <div className="modal-content">
          <div className="unit-overview">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-header">
                  <img src="/TradeDamage/ui/s_gui_icon_buff_health.png" alt="Здоровье" className="stat-icon" />
                  <span className="stat-label">Здоровье</span>
                </div>
                <div className="stat-value">{unit.health}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <img src="/TradeDamage/ui/s_gui_icon_buff_damage.png" alt="Урон" className="stat-icon" />
                  <span className="stat-label">Урон</span>
                </div>
                <div className="stat-value">{unit.damage}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <img src="/TradeDamage/ui/s_gui_icon_buff_atkspeed.png" alt="Скорость атаки" className="stat-icon" />
                  <span className="stat-label">Скорость атаки</span>
                </div>
                <div className="stat-value">{unit.attackSpeed}s</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <img src="/TradeDamage/ui/s_gui_icon_buff_crtchance.png" alt="Крит шанс" className="stat-icon" />
                  <span className="stat-label">Крит шанс</span>
                </div>
                <div className="stat-value">{unit.critChance}%</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <img src="/TradeDamage/ui/s_gui_button_battlestatistics.png" alt="Крит урон" className="stat-icon" />
                  <span className="stat-label">Крит урон</span>
                </div>
                <div className="stat-value">x{unit.critDamage}</div>
              </div>
            </div>

            {/* Специальности */}
            <div className="specialties-section">
              <h3 className="section-title">Особенности</h3>
              <div className="specialties-grid">
                <div className="specialty-card" style={{ '--specialty-color': specialtyColor } as React.CSSProperties}>
                  <span className="specialty-label">Специальность</span>
                  <span className="specialty-value">{unit.specialty}</span>
                </div>
                
                {unit.role && unit.role.toLowerCase() !== unit.specialty && (
                  <div className="specialty-card">
                    <span className="specialty-label">Роль</span>
                    <span className="specialty-value">{unit.role}</span>
                  </div>
                )}
                
                {unit.damageType && unit.damageType.toLowerCase() !== unit.specialty && (
                  <div className="specialty-card">
                    <span className="specialty-label">Тип урона</span>
                    <span className="specialty-value">{unit.damageType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Способности */}
            <div className="abilities-section">
              <h3 className="section-title">Способности</h3>
              <div className="abilities-list">
                <div className="ability-item">
                  <div className="ability-header">
                    <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Способность" className="ability-icon" />
                    <span className="ability-name">{unit.skill1}</span>
                  </div>
                </div>
                <div className="ability-item">
                  <div className="ability-header">
                    <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Способность" className="ability-icon" />
                    <span className="ability-name">{unit.skill2}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Описание и усиления */}
            <div className="description-section">
              <h3 className="section-title">Описание</h3>
              <p className="unit-description">{unit.description}</p>
              
              <h3 className="section-title">Усиление</h3>
              <p className="enhancement-text">{unit.enhancement}</p>
            </div>

            {/* Прогресс-бары */}
            <div className="progress-section">
              <div className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">Уникальность</span>
                  <span className="progress-value">{unit.uniqueness}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${unit.uniqueness}%` }}
                  />
                </div>
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">Мощь</span>
                  <span className="progress-value">{unit.power}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${unit.power}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Стоимость */}
            <div className="cost-section">
              <div className="cost-display">
                <img src="/TradeDamage/ui/s_gui_map_legend_goods.png" alt="Стоимость" className="cost-icon" />
                <span className="cost-value">{unit.cost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
