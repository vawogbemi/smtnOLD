import { getPackageCount } from "./helperFunctions";
import { supabase } from "./supabase";



export async function getOrCreateShipment(
  formData: FormData
) {
  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("from", formData.get("from") as string)
    .eq("to", formData.get("to") as string)
    .eq("method", formData.get("method") as string)
    .eq("status", 0)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (shipments) return shipments;

  const { data: newShipments, error: newShipmentError } = await supabase
    .from("shipments")
    .insert({
      from: formData.get("from") as string,
      to: formData.get("to") as string,
      method: formData.get("method") as string,
      packages: 0,
      status: 0,
    })
    .select("*")
    .single();

  if (newShipmentError) {
    console.error(`dashboard | newShipmentError: ${newShipmentError.message}`);
    return null;
  }

  return newShipments;
}

export async function updateShipmentPackages(
  shipment: { id: number },
  formData: FormData
) {
  const { error: incrementError } = await supabase.rpc("increment", {
    table_name: "shipments",
    row_id: shipment.id,
    x: getPackageCount(formData),
    field_name: "packages",
  });

  if (incrementError) {
    console.log(incrementError);
  }
}

