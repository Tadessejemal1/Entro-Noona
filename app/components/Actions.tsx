import React, { useState } from "react";
import StepTemplate from "./StepTemplate";
import { AtSign, MessageSquare, Webhook } from 'lucide-react';

const allActions = [
  { id: 'email', icon: <AtSign />, text: "Send custom email" },
  { id: 'sms', icon: <MessageSquare />, text: "Send SMS message" },
  { id: 'webhook', icon: <Webhook />, text: "Trigger Entro webhook" },
];

type ActionsProps = {
  onContinue: (selectedAction: string | null) => void;
  actions: string[];
};

const Actions: React.FC<ActionsProps> = ({ onContinue, actions }) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const handleActionClick = (action: string) => setSelectedAction(action);
  const availableActions = allActions.filter(x => actions.includes(x.id));

  return (
    <StepTemplate question="Choose an action" onContinue={() => onContinue(selectedAction)} buttonText="Continue">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-white rounded-lg shadow-md">
        {availableActions.map((action, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center border transition border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
              selectedAction === action.id ? 'border-2 border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleActionClick(action.id)}
          >
            <ActionButton icon={action.icon} text={action.text} />
          </div>
        ))}
      </div>
    </StepTemplate>
  );
};

type ActionButtonProps = {
  icon: React.ReactNode;
  text: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text }) => (
  <div className="flex flex-col items-center">
    <div className="text-blue-500 mb-4">{icon}</div>
    <div className="text-gray-700 text-center text-sm">{text}</div>
  </div>
);

export default Actions;
