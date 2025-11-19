import React, { useState, useEffect } from 'react';
import SelectTrigger from '~/components/SelectTrigger';
import SelectStock from '~/components/SelectStock';
import SelectServiceType from '~/components/SelectServiceType';
import SelectName from '~/components/SelectName';
import NotImplemented from '~/components/NotImplemented';
import Interval from '~/components/Interval';
import TemplateForm from '~/components/TemplateForm';
import Actions from '~/components/Actions';
import * as database from '~/shared/database';
import { protectEndpoint } from '~/utils/protect-endpoint';
import { json, redirect } from '@remix-run/node';
import { getEventTypesByCompanyId } from '~/shared/api';
import { getAccessTokenFromCookie, getCompanyIdFromCookie } from '~/utils/session-helpers';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';

enum View {
  SELECT_TRIGGER = 'SELECT_TRIGGER',
  SELECT_SERVICE_TYPE = 'SELECT_SERVICE_TYPE',
  INTERVAL_BEFORE_EVENT = 'INTERVAL_BEFORE_EVENT',
  INTERVAL_AFTER_EVENT = 'INTERVAL_AFTER_EVENT',
  ACTIONS = 'ACTIONS',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEBHOOK = 'WEBHOOK',
  SELECT_STOCK = 'SELECT_STOCK',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  SELECT_NAME = 'SELECT_NAME'
}

enum Trigger {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  TIME_BEFORE_APPOINTMENT = 'TIME_BEFORE_APPOINTMENT',
  TIME_AFTER_APPOINTMENT = 'TIME_AFTER_APPOINTMENT',
  NEW_CUSTOMER = 'NEW_CUSTOMER',
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  STOCK_LOW = 'STOCK_LOW',
}

export const loader = async ({ request }) => {
  await protectEndpoint(request);
  const companyId = await getCompanyIdFromCookie(request);
  const token = await getAccessTokenFromCookie(request);
  const eventTypes = await getEventTypesByCompanyId(companyId, token);
  return json({ eventTypes, companyId });
};

export const action = async ({ request }) => {
  await protectEndpoint(request);

  const formData = await request.formData();
  const trigger = formData.get('trigger');
  const action = formData.get('action');
  const name = formData.get('name');
  const companyId = formData.get('companyId');
  const settings = JSON.parse(formData.get('settings'));

  // TODO: Input validation

  await database.addWorkflow(trigger, action, settings, name, companyId);

  return redirect('/workflows');
};

const Wizard = () => {
  const [view, setView] = useState<View>(View.SELECT_NAME);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [settings, setSettings] = useState({});
  const [name, setName] = useState('');
  const [action, setAction] = useState<string | null>(null);
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const { companyId, eventTypes } = useLoaderData<typeof loader>();

  const getActions = () => {
    const actionsMap: Record<Trigger, string[]> = {
      [Trigger.APPOINTMENT_BOOKED]: ['email', 'sms', 'webhook'],
      [Trigger.TIME_BEFORE_APPOINTMENT]: ['email', 'sms', 'webhook'],
      [Trigger.TIME_AFTER_APPOINTMENT]: ['email', 'sms', 'webhook'],
      [Trigger.NEW_CUSTOMER]: ['email', 'sms', 'webhook'],
      [Trigger.TRANSACTION_CREATED]: ['email', 'sms', 'webhook'],
      [Trigger.STOCK_LOW]: ['email', 'sms', 'zapier', 'webhook'],
    };

    return trigger ? actionsMap[trigger] : [];
  };

  const actions = getActions();


  const handleSelectTrigger = (triggerType: Trigger) => {
    setTrigger(triggerType);

    const viewMap: Record<Trigger, View> = {
      [Trigger.APPOINTMENT_BOOKED]: View.SELECT_SERVICE_TYPE,
      [Trigger.TIME_BEFORE_APPOINTMENT]: View.SELECT_SERVICE_TYPE,
      [Trigger.TIME_AFTER_APPOINTMENT]: View.SELECT_SERVICE_TYPE,
      [Trigger.NEW_CUSTOMER]: View.ACTIONS,
      [Trigger.TRANSACTION_CREATED]: View.ACTIONS,
      [Trigger.STOCK_LOW]: View.SELECT_STOCK,
    };

    const view = viewMap[triggerType] || View.NOT_IMPLEMENTED;
    setView(view);
  };

  const handleServiceType = (serviceType: { id: string; title: string; description: string }) => {
    const viewMap: Partial<Record<Trigger, View>> = {
      [Trigger.TIME_BEFORE_APPOINTMENT]: View.INTERVAL_BEFORE_EVENT,
      [Trigger.TIME_AFTER_APPOINTMENT]: View.INTERVAL_AFTER_EVENT,
      [Trigger.APPOINTMENT_BOOKED]: View.ACTIONS
    };

    setSettings(old => ({
      ...old,
      serviceType: serviceType.id,
      eventTitle: serviceType.title, // Store event title
      eventDescription: serviceType.description // Store event description
    }));

    const view = trigger ? viewMap[trigger] : View.ACTIONS;
    setView(view);
  };

  const handleAction = (a: string) => {
    setAction(a);
    const viewMap: Record<string, View> = { 
      'email': View.EMAIL, 
      'sms': View.SMS,
      'webhook': View.WEBHOOK 
    };
    const view = viewMap[a] || View.NOT_IMPLEMENTED;
    setView(view);
  };

  const handleInterval = (interval) => {
    setSettings(old => ({ ...old, interval }));
    setView(View.ACTIONS);
  }

  const handleTemplateForm = (template) => {
    const templateKey = action === 'email' ? 'emailTemplate' : action === 'sms' ? 'smsTemplate' : 'webhookTemplate';
    setSettings(old => {
      return { ...old, [templateKey]: template };
    });
    setShouldSubmit(true);
  }

  useEffect(() => {
    if (shouldSubmit) {
      done();
      setShouldSubmit(false);
    }
  }, [shouldSubmit]);

  const handleStock = (stock) => {
    setSettings(old => ({ ...old, stock }));
    setView(View.ACTIONS);
  }

  const submit = useSubmit();

  const done = () => {
    const formElement = document.getElementById('wizard-form') as HTMLFormElement;
    submit(formElement);
  };

  const handleName = (n: string) => {
    setName(n);
    setView(View.SELECT_TRIGGER)
  }

  const viewComponents: Record<View, JSX.Element> = {
    [View.SELECT_NAME]: <SelectName onContinue={handleName} />,
    [View.SELECT_TRIGGER]: <SelectTrigger onContinue={handleSelectTrigger} />,
    [View.SELECT_SERVICE_TYPE]: <SelectServiceType onContinue={handleServiceType} eventTypes={eventTypes} />,
    [View.SELECT_STOCK]: <SelectStock onContinue={handleStock} />,
    [View.INTERVAL_BEFORE_EVENT]: <Interval text="before" onContinue={handleInterval} />,
    [View.INTERVAL_AFTER_EVENT]: <Interval text="after" onContinue={handleInterval} />,
    [View.ACTIONS]: <Actions actions={actions} onContinue={handleAction} />,
    [View.EMAIL]: <TemplateForm action="email" initialData={{ subject: '', body: '', recipients: '' }} onContinue={handleTemplateForm} buttonText="Continue" />,
    [View.SMS]: <TemplateForm action="sms" initialData={{ body: '', recipients: '' }} onContinue={handleTemplateForm} buttonText="Continue" />,
    [View.WEBHOOK]: <TemplateForm action="webhook" initialData={{ body: '' }} onContinue={handleTemplateForm} buttonText="Continue" />,
    [View.NOT_IMPLEMENTED]: <NotImplemented />,
  };

  return (
    <Form method="POST" id="wizard-form" action="/wizard">
      <input type="hidden" name="trigger" value={trigger || ''} />
      <input type="hidden" name="action" value={action || ''} />
      <input type="hidden" name="name" value={name || ''} />
      <input type="hidden" name="settings" value={JSON.stringify(settings)} />
      <input type="hidden" name="companyId" value={companyId || ''} />
      {viewComponents[view]}
    </Form>
  );
};

export default Wizard;
