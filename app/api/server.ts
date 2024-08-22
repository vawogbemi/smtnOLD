import { createServerClient, parse, serialize } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Database } from "database.types";
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

export function supabaseAnonServerClient(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    }
  );

  return supabase;
}

export function supabaseServiceRoleClient() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  return supabase;
}

export async function createReceiever(name: string, phone: string) {
  const supabase = supabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("receivers")
    .insert({ name: name, phone: phone })
    .select("*");

  if (error) {
    console.error(`createReceiverError: ${error.message}`);
  }

  return data;
}

export async function createReference(
  shipment: number,
  description: string,
  notes: string,
  packages: number,
  total_weight: number,
  small: number,
  large: number,
  paid: boolean,
  sender: number,
  receiver: number,
  shipping:number,
  clearance:number,
) {
  const supabase = supabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("references")
    .insert({
      shipment: shipment,
      description: description,
      notes: notes,
      packages: packages,
      total_weight: total_weight,
      small: small,
      large: large,
      paid: paid,
      sender: sender,
      receiver: receiver,
      shipping: shipping ?? 0,
      clearance: clearance ?? 0,
    })
    .select("*");

  if (error) {
    console.error(`createReferenceError: ${error.message}`);
  }

  return data;
}

export async function sendBatchSms(){
  return twilioClient.messages
}