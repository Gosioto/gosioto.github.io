'use client';

import React, { useState } from 'react';
import { Unit, Scroll, Badge, Food, SquadUnit } from '@/types/tradedamage';
import { scrolls, badges, food } from '@/data/tradedamage';

interface UnitEditModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUnit: SquadUnit) => void;
}

export default function UnitEditModal({ unit, isOpen, onClose, onSave }: UnitEditModalProps) {
  const [selectedScrolls, setSelectedScrolls] = useState<Scroll[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  if (!isOpen) return null;

  const getRarityColor = (level: number) => {
    if (level >= 10) return '#ff6b35';
    if (level >= 8) return '#9f7aea';
    if (level >= 6) return '#3182ce';
    if (level >= 4) return '#38a169';
    return '#718096';
  };

  const rarityColor = getRarityColor(unit.level);

  const handleScrollToggle = (scroll: Scroll) => {
    setSelectedScrolls(prev => 
      prev.find(s => s.id === scroll.id) 
        ? prev.filter(s => s.id !== scroll.id)
        : [...prev, scroll]
    );
  };

  const handleBadgeToggle = (badge: Badge) => {
    setSelectedBadges(prev => 
      prev.find(b => b.id === badge.id) 
        ? prev.filter(b => b.id !== badge.id)
        : [...prev, badge]
    );
  };

  const handleFoodSelect = (foodItem: Food) => {
    setSelectedFood(selectedFood?.id === foodItem.id ? null : foodItem);
  };

  const handleSave = () => {
    const updatedUnit: SquadUnit = {
      unit,
      scrolls: selectedScrolls,
      badges: selectedBadges,
      food: selectedFood || undefined
    };
    onSave(updatedUnit);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="modal-header">
          <div className="unit-header-info">
            <img src={unit.icon} alt={unit.name} className="modal-unit-icon" />
            <div className="unit-title">
              <h2 className="unit-name">Настройка: {unit.name}</h2>
              <div className="unit-level-badge" style={{ '--rarity-color': rarityColor } as React.CSSProperties}>
                <img src="/TradeDamage/ui/s_gui_mercenaries_merclevel.png" alt="Уровень" className="level-icon" />
                Уровень {unit.level}
              </div>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <img src="/TradeDamage/ui/s_gui_dialog_button_exit.png" alt="Закрыть" className="close-icon" />
          </button>
        </div>

        {/* Контент */}
        <div className="modal-content">
          <div className="edit-sections">
            {/* Свитки */}
            <div className="edit-section">
              <h3 className="section-title">
                <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Свитки" className="section-icon" />
                Свитки
              </h3>
              <div className="items-grid">
                {scrolls.map(scroll => (
                  <div 
                    key={scroll.id}
                    className={`item-card ${selectedScrolls.find(s => s.id === scroll.id) ? 'selected' : ''}`}
                    onClick={() => handleScrollToggle(scroll)}
                  >
                    <img src={scroll.icon} alt={scroll.name} className="item-icon" />
                    <div className="item-info">
                      <h4 className="item-name">{scroll.name}</h4>
                      <p className="item-effect">{scroll.effect}</p>
                      <div className="item-cost">
                        <img src="/TradeDamage/ui/s_gui_map_legend_goods.png" alt="Стоимость" className="cost-icon" />
                        {scroll.cost}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Значки */}
            <div className="edit-section">
              <h3 className="section-title">
                <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Значки" className="section-icon" />
                Значки
              </h3>
              <div className="items-grid">
                {badges.map(badge => (
                  <div 
                    key={badge.id}
                    className={`item-card ${selectedBadges.find(b => b.id === badge.id) ? 'selected' : ''}`}
                    onClick={() => handleBadgeToggle(badge)}
                  >
                    <img src={badge.icon} alt={badge.name} className="item-icon" />
                    <div className="item-info">
                      <h4 className="item-name">{badge.name}</h4>
                      <p className="item-effect">{badge.passiveBonus}</p>
                      <div className="item-cost">
                        <img src="/TradeDamage/ui/s_gui_map_legend_goods.png" alt="Стоимость" className="cost-icon" />
                        {badge.cost}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Еда */}
            <div className="edit-section">
              <h3 className="section-title">
                <img src="/TradeDamage/ui/s_gui_interface_green_checksign.png" alt="Еда" className="section-icon" />
                Еда
              </h3>
              <div className="items-grid">
                {food.map(foodItem => (
                  <div 
                    key={foodItem.id}
                    className={`item-card ${selectedFood?.id === foodItem.id ? 'selected' : ''}`}
                    onClick={() => handleFoodSelect(foodItem)}
                  >
                    <img src={foodItem.icon} alt={foodItem.name} className="item-icon" />
                    <div className="item-info">
                      <h4 className="item-name">{foodItem.name}</h4>
                      <p className="item-effect">{foodItem.description}</p>
                      <div className="item-cost">
                        <img src="/TradeDamage/ui/s_gui_map_legend_goods.png" alt="Стоимость" className="cost-icon" />
                        {foodItem.cost}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="modal-actions">
            <button className="cancel-button" onClick={onClose}>
              Отмена
            </button>
            <button className="save-button" onClick={handleSave}>
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
