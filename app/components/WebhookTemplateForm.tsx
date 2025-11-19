import React, { useState } from 'react';
import StepTemplate from './StepTemplate';
import TextEditor from '~/components/TextEditor'; // Make sure this path matches where you saved the TextEditor component

type WebhookTemplateFormProps = {
  onContinue: (data: { body: string }) => void;
};

const WebhookTemplateForm: React.FC<WebhookTemplateFormProps> = ({ onContinue }) => {
  const [body, setBody] = useState<string>('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue({ body });
  };

  return (
    <StepTemplate question="Create an Webhook template" onContinue={e => handleSubmit(e)}>
      <form className="p-8" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="body">
            Body:
          </label>
          <TextEditor value={body} onChange={setBody} />
        </div>
      </form>
    </StepTemplate>
  );
};

export default WebhookTemplateForm;
