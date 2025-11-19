import React, { ReactNode } from 'react';

type StepTemplateProps = {
  onContinue: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  question: string;
  children: ReactNode;
  buttonText: string;
};

const StepTemplate: React.FC<StepTemplateProps> = ({ onContinue, question, children, buttonText }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{question}</h1>
      </div>
      <div className="shadow-lg rounded-lg mb-4 bg-white p-8">
        <div className="relative">
          {children}
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition duration-300 ease-in-out transform hover:-translate-y-1"
          onClick={onContinue}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default StepTemplate;
