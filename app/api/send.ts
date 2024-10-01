import { supabase } from "./supabase";
import { sendSms } from "./twilio";

export async function sendConfirmation(
  formData: FormData,
  reference: { id: number }
) {
  const body = `Your reference has been created\n\nTrack your package(s) here: https://www.smtninternational.com/tracking/${reference.id}\n\nThank you for choosing SMTN International! \n\nAdvertisement\n____________________\nCover you wife with the blood of Jesus\nhttps://www.prayformywife.com \n\nDO NOT REPLY TO THIS NUMBER`;

  await Promise.all([
    sendSms({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formData.get("phone") as string,
      body,
    }),
    sendSms({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formData.get("receiver_phone") as string,
      body,
    }),
  ]).catch((err) => console.log(err));
}

export async function sendMessage(formData: FormData, shipment: number) {
  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select("id, customers(name, phone), receivers(name, phone)")
    .eq("shipment", shipment);

  if (referencesError) {
    console.error(
      `dashboard/shipments | referencesError: ${referencesError.message}`
    );
    return null;
  }

  references.forEach(async (reference) => {
    if (reference.id && reference.customers && reference.receivers)
      await sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: reference?.customers?.phone ?? "",
        body: formData.get("message") as string,
      });
    if (reference.customers?.phone !== reference.receivers?.phone) {
      await sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: reference?.receivers?.phone ?? "",
        body: formData.get("message") as string,
      });
    }
  });
}
