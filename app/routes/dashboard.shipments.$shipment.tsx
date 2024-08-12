import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";
import { ShipmentTable } from "~/components/ShipmentTable/ShipmentTable";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select("*, customers (id, name), receivers (id, name)")
    .eq("shipment", params.shipment!)
    .order("id", { ascending: true });

  if (referencesError) {
    console.error(
      `shipmentDetails | referencesError: ${referencesError.message}`
    );
  }

  return json({ references });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
 
  if (formData.get("action") === "paid"){
    const supabase = supabaseServiceRoleClient();
    const { error } = await supabase
      .from("references")
      .update({ paid: parseInt(formData.get("paid") as string) ? false : true })
      .eq("id", formData.get("id") as string)
      .single();

    if (error) {
      console.error(`shipmentDetails | paidError: ${error.message}`);
    }
    return null;
  }

  if (formData.get("action") === "received"){
    const supabase = supabaseServiceRoleClient();
    const { error } = await supabase
      .from("references")
      .update({ received: parseInt(formData.get("received") as string) ? false : true })
      .eq("id", formData.get("id") as string)
      .single();

    if (error) {
      console.error(`shipmentDetails | receivedError: ${error.message}`);
    }
    return null;
  }

  return null;
}


export default function Shipment() {
  const { references } = useLoaderData<typeof loader>();
  const { shipment } = useOutletContext<{
    shipment:
      | {
          created_at: string;
          from: string;
          id: number;
          last_updated: string;
          method: string;
          packages: number;
          status: number;
          to: string;
        }
      | undefined;
  }>();

  const data = (references ?? []).map((reference) => ({
    reference: reference.id,
    sender: {
      id: reference.customers?.id ?? 0,
      name: reference.customers?.name ?? "Unknown",
    },
    receiver: {
      id: reference.receivers?.id ?? 0,
      name: reference.receivers?.name ?? "Unknown",
    },
    description: reference.description,
    paid: reference.paid,
    received: reference.received,
    packages: reference.packages,
    total_weight: reference.total_weight,
    small: reference.small,
    large: reference.large,
  }));

  return (
    <>
      {shipment && data ? (
        <>
          <ShipmentTable data={data} method={shipment.method} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
