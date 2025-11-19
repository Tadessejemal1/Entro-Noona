import React, { useState, useEffect } from 'react';
import { AiOutlineMail, AiOutlineMessage, AiOutlineApi, AiOutlineInfoCircle } from 'react-icons/ai';
import StepTemplate from './StepTemplate';
import 'react-quill/dist/quill.snow.css';
import HtmlEditor from '~/components/HtmlEditor';

type TemplateFormProps = {
  initialData?: { subject?: string; body?: string; recipients?: string };
  action: 'email' | 'sms' | 'webhook';
  onContinue: (data: { action: string; subject?: string; body?: string; recipients?: string }) => void;
  buttonText: string;
  mode: 'create' | 'update';
};

const TemplateForm: React.FC<TemplateFormProps> = ({ initialData = { subject: '', body: '', recipients: '' }, action, onContinue, buttonText, mode }) => {
  const [subject, setSubject] = useState<string>(initialData.subject || '');
  const [body, setBody] = useState<string>(initialData.body || '');
  const [recipients, setRecipients] = useState<string[]>(initialData.recipients?.split(',').map(item => item.trim()).filter(item => item) || []);
  const [recipientInput, setRecipientInput] = useState<string>('');

  useEffect(() => {
    setSubject(initialData.subject || '');
    setBody(initialData.body || '');
    setRecipients(initialData.recipients?.split(',').map(item => item.trim()).filter(item => item) || []);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data: { action: string; subject?: string; body?: string; recipients?: string } = { action, subject, recipients: recipients.join(', ') };
    if (action !== 'webhook') {
      data.body = body;
    }
    onContinue(data);
  };

  const insertPlaceholder = (placeholder: string, target: 'subject' | 'body' | 'recipients') => {
    const formattedPlaceholder = `{{${placeholder}}}`;
    if (target === 'subject') {
      setSubject(subject + ` ${formattedPlaceholder}`);
    } else if (target === 'body') {
      setBody(body + ` ${formattedPlaceholder}`);
    } else if (target === 'recipients') {
      setRecipients([...recipients, formattedPlaceholder].filter(item => item));
    }
  };

  const handleRecipientInput = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && recipientInput.trim()) {
      e.preventDefault();
      if (action === 'email' && recipientInput.includes('@')) {
        setRecipients([...recipients, recipientInput.trim()]);
        setRecipientInput('');
      } else if (action === 'sms' && isValidPhoneNumber(recipientInput.trim())) {
        setRecipients([...recipients, recipientInput.trim()]);
        setRecipientInput('');
      }
    }
  };

  const isValidPhoneNumber = (number) => {
    const ethiopianPhoneRegex = /^(?:\+251|251|0)?[1-9]\d{8}$/;
    const icelandicPhoneRegex = /^(?:\+354|354)?\d{7}$/;
    return ethiopianPhoneRegex.test(number) || icelandicPhoneRegex.test(number);
  };

  const removeRecipient = (item) => {
    setRecipients(recipients.filter(recipient => recipient !== item));
  };

  const displayRecipient = (recipient) => {
    if (recipient === '{{customerEmail}}') {
      return 'customer email';
    } else if (recipient === '{{customerPhone}}') {
      return 'customer phone';
    }
    return recipient;
  };

  const getIconAndText = () => {
    const actionText = mode === 'create' ? 'Create' : 'Update';
    switch (action) {
      case 'email':
        return { icon: <AiOutlineMail className="text-blue-500 w-6 h-6 mr-2" />, text: `${actionText} an Email Template` };
      case 'sms':
        return { icon: <AiOutlineMessage className="text-green-500 w-6 h-6 mr-2" />, text: `${actionText} an SMS Template` };
      case 'webhook':
        return { icon: <AiOutlineApi className="text-yellow-500 w-6 h-6 mr-2" />, text: `${actionText} a Webhook Template` };
      default:
        return { icon: null, text: '' };
    }
  };

  const { icon, text } = getIconAndText();

  return (
    <StepTemplate question={<div className="flex items-center">{icon}<span>{text}</span></div>} onContinue={handleSubmit} buttonText={buttonText}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {(action === 'email' || action === 'sms') && (
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="recipients">
              Recipients:
            </label>
            <div className="block w-full bg-white border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              {recipients.map((item, index) => (
                <span key={index} className="inline-flex items-center bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm px-3 py-1 mr-2 mb-2">
                  {displayRecipient(item)}
                  <span
                    onClick={() => removeRecipient(item)}
                    className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    &times;
                  </span>
                </span>
              ))}
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleRecipientInput}
                className="border-none outline-none focus:ring-0"
                placeholder={`Add recipient and press enter (${action === 'email' ? 'email' : 'phone'})`}
              />
            </div>
            <div className="mt-2 flex gap-2">
              {action === 'email' && (
                <span
                  onClick={() => insertPlaceholder('customerEmail', 'recipients')}
                  className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
                >
                  add customer email
                </span>
              )}
              {action === 'sms' && (
                <span
                  onClick={() => insertPlaceholder('customerPhone', 'recipients')}
                  className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
                >
                  add customer phone
                </span>
              )}
            </div>
          </div>
        )}
        {action === 'email' && (
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="subject">
              Subject:
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full bg-white border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter email subject"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                onClick={() => insertPlaceholder('eventTitle', 'subject')}
                className="bg-purple-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-purple-600 px-3 py-1"
              >
                Event title
              </span>
              <span
                onClick={() => insertPlaceholder('eventDescription', 'subject')}
                className="bg-purple-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-purple-600 px-3 py-1"
              >
                event description
              </span>
              <span
                onClick={() => insertPlaceholder('customerCode', 'subject')}
                className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
              >
                customer code
              </span>
              <span
                onClick={() => insertPlaceholder('customerEmail', 'subject')}
                className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
              >
                customer email
              </span>
              <span
                onClick={() => setSubject('')}
                className="bg-red-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-red-600 px-3 py-1"
              >
                remove all
              </span>
            </div>
          </div>
        )}
        {action !== 'webhook' && (
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="body">
              Body:
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden h-full">
              <HtmlEditor
                value={body}
                onChange={setBody}
                className="h-full"
                placeholder="Enter message body"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                onClick={() => insertPlaceholder('eventTitle', 'body')}
                className="bg-purple-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-purple-600 px-3 py-1"
              >
                event title
              </span>
              <span
                onClick={() => insertPlaceholder('eventDescription', 'body')}
                className="bg-purple-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-purple-600 px-3 py-1"
              >
                event description
              </span>
              <span
                onClick={() => insertPlaceholder('customerCode', 'body')}
                className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
              >
                customer code
              </span>
              <span
                onClick={() => insertPlaceholder('customerEmail', 'body')}
                className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
              >
                customer email
              </span>
              <span
                onClick={() => insertPlaceholder('customerName', 'body')}
                className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
              >
                customer name
              </span>
              <span
                onClick={() => insertPlaceholder('customerPhone', 'body')}
                className="bg-blue-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-blue-600 px-3 py-1"
              >
                customer phone
              </span>
              <span
                onClick={() => setBody('')}
                className="bg-red-500 text-white font-semibold rounded-[20px] cursor-pointer text-sm hover:bg-red-600 px-3 py-1"
              >
                remove all
              </span>
            </div>
          </div>
        )}
        {action === 'webhook' && (
          <div className="mb-6">
            <div className="flex items-start bg-yellow-100 border border-yellow-300 rounded-lg p-4">
              <AiOutlineInfoCircle className="text-yellow-500 w-6 h-6 mr-3" />
              <div className="text-sm text-yellow-700">
                This task will send event details from Noona to Entro. Make sure to include relevant information and use appropriate placeholders to ensure all required data is sent correctly.
              </div>
            </div>
          </div>
        )}
      </form>
    </StepTemplate>
  );
};

export default TemplateForm;
