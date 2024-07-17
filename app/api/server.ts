import { createServerClient, parse, serialize } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Database } from "database.types";
import twilio from "twilio";

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

export function singleton<Value>(name: string, value: () => Value): Value {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = global as any;
  g.__singletons ??= {};
  g.__singletons[name] ??= value();
  return g.__singletons[name];
}
