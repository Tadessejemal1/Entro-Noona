import React from "react";

type BoxWithCheckboxProps = {
  text: string;
  description?: string; // Optional description field
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const BoxWithCheckbox: React.FC<BoxWithCheckboxProps> = ({ text, description, checked, onChange }) => {
  return (
    <div className="flex items-center my-2 border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition duration-200 ease-in-out cursor-pointer">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-600"
        checked={checked}
        onChange={onChange}
      />
      <div className="ml-3">
        <span className="text-gray-700">{text}</span>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default BoxWithCheckbox;
