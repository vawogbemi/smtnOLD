import { supabase } from "./supabase";

export async function createCustomer(
  formData: FormData
) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      phone: formData.get("phone") as string,
      name: formData.get("name") as string,
      address: "",
      email: "",
    })
    .select("*")
    .single();

  if (error) {
    console.error(`dashboard | createCustomerError: ${error.message}`);
    return null;
  }

  return data;
}

export async function getCustomer(
  formData: FormData,
  field: string
) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq(field, formData.get(field) as string)
    .single();

  if (error) {
    console.error(`dashboard | queryCustomerError: ${error.message}`);
    return null;
  }

  return data;
}

export async function getOrCreateCustomer(
  formData: FormData,
  field: string
) {
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq(field, formData.get(field) as string)
    .single();

  return customers || (await createCustomer(formData));
}
