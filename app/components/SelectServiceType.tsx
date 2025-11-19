import React, { useState } from 'react';
import StepTemplate from './StepTemplate';
import BoxWithCheckbox from '~/components/BoxWithCheckbox';

type EventType = {
  id: string;
  title: string;
  description: string; // Added description field
};

type SelectServiceTypeProps = {
  onContinue: (serviceType: { id: string; title: string; description: string }) => void;
  eventTypes: EventType[];
};

const SelectServiceType: React.FC<SelectServiceTypeProps> = ({ onContinue, eventTypes }) => {
  const [selectedService, setSelectedService] = useState<{ id: string; title: string; description: string } | null>(null);

  const handleCheckboxChange = (type: EventType) => {
    setSelectedService(type);
  };

  return (
    <StepTemplate onContinue={() => selectedService && onContinue(selectedService)} question="Select service types" buttonText="Continue">
      <div className="relative p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eventTypes.map(type => (
            <BoxWithCheckbox
              key={type.id}
              text={type.title}
              description={type.description} // Display description
              checked={selectedService?.id === type.id}
              onChange={() => handleCheckboxChange(type)}
            />
          ))}
        </div>
      </div>
    </StepTemplate>
  );
};

export default SelectServiceType;
