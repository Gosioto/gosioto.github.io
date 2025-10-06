'use client';

import { useState } from 'react';

interface TradedamageHeaderProps {
  activeModal: string;
  onModalChange: (modal: string) => void;
}

export default function TradedamageHeader({ activeModal, onModalChange }: TradedamageHeaderProps) {
  const modalButtons = [
    { id: 'dps-calculator', label: 'Расчет DPS отряда' },
    { id: 'squad-builder', label: 'Подобрать отряд под бюджет с 0' },
    { id: 'squad-addition', label: 'Дополнение к отряду' },
    { id: 'sandbox', label: 'Песочница' }
  ];

  return (
    <header className="tradedamage-header">
      <div className="tradedamage-header-content">
        <div className="logo">
          <img src="/TradeDamage/TradeDamage.png" alt="TRADEDamage" className="logo-image" />
          <span className="logo-text">TRADEDamage: Deal to Die</span>
        </div>
        
        <nav className="nav">
          {modalButtons.map((button) => (
            <button
              key={button.id}
              className={`nav-button ${activeModal === button.id ? 'active' : ''}`}
              onClick={() => onModalChange(button.id)}
            >
              {button.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
