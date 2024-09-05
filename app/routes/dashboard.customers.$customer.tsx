import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { togglePaid, toggleReceived } from "~/api/reference";
import { supabase } from "~/api/supabase";
import { ShipmentTable } from "~/components/Shipment/ShipmentTable/ShipmentTable";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  switch (formData.get("action")) {
    case "paid": {
      togglePaid(formData);
      return null;
    }
    case "received": {
      toggleReceived(formData);
      return null;
    }
  }
  return null
}

export const loader = async ({ params }: LoaderFunctionArgs) => {

  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select("*, customers (id, name), receivers (id, name)")
    .eq("sender", params.customer!)
    .order("id", { ascending: false });

  if (referencesError) {
    console.error(
      `shipmentDetails | referencesError: ${referencesError.message}`
    );
  }

  return json({ references });
};

export default function Shipment() {
  const { references } = useLoaderData<typeof loader>();
  const { customer } = useOutletContext<{
    customer:
      | {
          address: string;
          created_at: string;
          email: string;
          id: number;
          name: string;
          phone: string;
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
    notes: reference.notes,
    description: reference.description,
    paid: reference.paid,
    received: reference.received,
    packages: reference.packages,
    total_weight: reference.total_weight,
    small: reference.small,
    large: reference.large,
    shipping: reference.shipping,
    clearance: reference.clearance,
  }));

  return (
    <>
      {customer && data ? (
        <>
          <ShipmentTable data={data} method={"all"} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
