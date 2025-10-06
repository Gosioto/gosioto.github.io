'use client';

import { useState } from 'react';
import '@/styles/tradedamage.css';
import TradedamageHeader from '@/components/tradedamage/TradedamageHeader';
import DPSCalculator from '@/components/tradedamage/DPSCalculator';
import SquadBuilder from '@/components/tradedamage/SquadBuilder';
import SquadAddition from '@/components/tradedamage/SquadAddition';
import Sandbox from '@/components/tradedamage/Sandbox';

export default function TradedamagePage() {
  const [activeModal, setActiveModal] = useState('dps-calculator');

  const renderActiveModal = () => {
    switch (activeModal) {
      case 'dps-calculator':
        return <DPSCalculator />;
      case 'squad-builder':
        return <SquadBuilder />;
      case 'squad-addition':
        return <SquadAddition />;
      case 'sandbox':
        return <Sandbox />;
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
