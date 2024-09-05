import { getLargeCount, getPackageCount, getSmallCount, getTotalWeight } from "./helperFunctions";
import { createBoxes } from "./boxes";
import { supabase } from "./supabase";


export async function createReference(formData: FormData) {
  const { data, error } = await supabase
    .from("references")
    .insert({
      shipment: parseInt(formData.get("shipment") as string),
      description: formData.get("description") as string,
      notes: formData.get("notes") as string,
      packages: getPackageCount(formData),
      total_weight: getTotalWeight(formData),
      small: getSmallCount(formData),
      large: getLargeCount(formData),
      paid: formData.get("paid") === "true",
      sender: parseInt(formData.get("sender") as string),
      receiver: parseInt(formData.get("receiver") as string),
      shipping: parseInt(formData.get("shipping") as string) || 0,
      clearance: parseInt(formData.get("clearance") as string) || 0,
    })
    .select();

  if (error) {
    console.error(`createReferenceError: ${error.message}`);
    throw error;
  }

  return data[0] || null;
}

export async function createReferenceAndBoxes(
  formData: FormData,
  shipment: { id: number; packages: number },
  customer: { id: number },
  receiver: { id: number }
) {
  // Update formData with shipment, customer, and receiver IDs
  formData.set("shipment", shipment.id.toString());
  formData.set("sender", customer.id.toString());
  formData.set("receiver", receiver.id.toString());

  const reference = await createReference(formData);

  if (!reference) return null;

  if (formData.get("method") === "air") {
    await createBoxes(formData, shipment, reference);
  }

  return reference;
}

export async function togglePaid(formData: FormData) {
  const { error } = await supabase
    .from("references")
    .update({
      paid: parseInt(formData.get("paid") as string) ? false : true,
    })
    .eq("id", formData.get("id") as string)
    .single();

  if (error) {
    console.error(`shipmentDetails | paidError: ${error.message}`);
  }

}

export async function toggleReceived(formData: FormData) {
  const { error } = await supabase
    .from("references")
    .update({
      received: parseInt(formData.get("received") as string) ? false : true,
    })
    .eq("id", formData.get("id") as string)
    .single();

  if (error) {
    console.error(`shipmentDetails | receivedError: ${error.message}`);
  }
}