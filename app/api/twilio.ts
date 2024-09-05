import twilio from "twilio";

function singleton<Value>(name: string, value: () => Value): Value {
  const g = global as { __singletons?: Record<string, Value> };
  g.__singletons ??= {};
  g.__singletons[name] ??= value();
  return g.__singletons[name];
}

const twilioClient: twilio.Twilio = singleton<twilio.Twilio>("twilio", () =>
  twilio(
    process.env.TWILIO_ACCOUNT_SID as string,
    process.env.TWILIO_AUTH_TOKEN as string
  )
);

export async function sendSms(request: {
  from: string;
  to: string;
  body: string;
}) {
  return twilioClient.messages.create(request);
}

