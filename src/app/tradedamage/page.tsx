'use client';

import { useState } from 'react';
import '@/styles/tradedamage.css';
import TradedamageHeader from '@/components/tradedamage/TradedamageHeader';
import DPSCalculator from '@/components/tradedamage/DPSCalculator';

export default function TradedamagePage() {
  const [activeModal, setActiveModal] = useState('dps-calculator');

  const renderActiveModal = () => {
    switch (activeModal) {
      case 'dps-calculator':
        return <DPSCalculator />;
      case 'squad-builder':
        return <div className="modal-placeholder">Подобрать отряд под бюджет с 0</div>;
      case 'squad-addition':
        return <div className="modal-placeholder">Дополнение к отряду</div>;
      case 'sandbox':
        return <div className="modal-placeholder">Песочница</div>;
      default:
        return <DPSCalculator />;
    }
  };

  return (
    <div className="tradedamage-page">
      <TradedamageHeader 
        activeModal={activeModal} 
        onModalChange={setActiveModal} 
      />
      
      <main className="tradedamage-main">
        {renderActiveModal()}
      </main>
    </div>
  );
}
