import { supabase } from "./supabase";

export async function createReceiever(formData: FormData) {
  const { data, error } = await supabase
    .from("receivers")
    .insert({ name: formData.get("receiver_name") as string, phone: formData.get("receiver_phone") as string })
    .select("*");

  if (error) {
    console.error(`createReceiverError: ${error.message}`);
  }

  return data;
}
