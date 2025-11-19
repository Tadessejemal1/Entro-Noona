import React, { useState } from 'react';
import StepTemplate from './StepTemplate';

type IntervalProps = {
  text: string;
  onContinue: (interval: { days: number; hours: number; minutes: number }) => void;
};

const Interval: React.FC<IntervalProps> = ({ text: inputText, onContinue }) => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(3);
  const [minutes, setMinutes] = useState<number>(0);

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => setDays(Number(e.target.value));
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => setHours(Number(e.target.value));
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinutes(Number(e.target.value));

  const text = `How many days/hours/minutes ${inputText} the appointment should the workflow run?`;

  return (
    <StepTemplate onContinue={() => onContinue({ days, hours, minutes })} question={text} buttonText="Continue">
      <div className="flex space-x-4 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col w-full">
          <label htmlFor="days" className="text-gray-700 mb-1">Days</label>
          <input
            type="number"
            id="days"
            name="days"
            className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            value={days}
            onChange={handleDaysChange}
          />
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="hours" className="text-gray-700 mb-1">Hours</label>
          <input
            type="number"
            id="hours"
            name="hours"
            className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            value={hours}
            onChange={handleHoursChange}
          />
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="minutes" className="text-gray-700 mb-1">Minutes</label>
          <input
            type="number"
            id="minutes"
            name="minutes"
            className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            value={minutes}
            onChange={handleMinutesChange}
          />
        </div>
      </div>
    </StepTemplate>
  );
};

export default Interval;
