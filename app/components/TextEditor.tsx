import React from 'react';

const TextEditor: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full bg-white border hover:border-gray-500 px-4 py-2 shadow leading-tight focus:outline-none focus:shadow-outline"
      rows={10}
    />
  );
};

export default TextEditor;
