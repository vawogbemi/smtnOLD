import { supabase } from "./supabase";

export async function createBoxes(
  formData: FormData,
  shipment: { packages: number },
  reference: { id: number }
) {
  const boxes = [
    ...Array(parseInt(formData.get("number_of_boxes") as string)),
  ].map((_, i) => ({
    number: shipment.packages + i + 1,
    reference: reference.id,
    length: parseInt(formData.get(`length_${i + 1}`) as string),
    width: parseInt(formData.get(`width_${i + 1}`) as string),
    height: parseInt(formData.get(`height_${i + 1}`) as string),
    weight: parseInt(formData.get(`weight_${i + 1}`) as string),
  }));

  const { error: boxesError } = await supabase.from("boxes").insert(boxes);

  if (boxesError) {
    console.log(`dashboard | boxesError: ${boxesError.message}`);
  }
}


