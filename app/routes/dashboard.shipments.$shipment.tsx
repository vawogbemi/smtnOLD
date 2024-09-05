import { ComboboxItem } from "@mantine/core";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { supabase } from "~/api/supabase";
import { MessageCard } from "~/components/MessageCard/MessageCard";
import { ShipmentTable } from "~/components/Shipment/ShipmentTable/ShipmentTable";
import { sendMessage } from "~/api/send";
import { togglePaid, toggleReceived } from "~/api/reference";

export const loader = async ({ params }: LoaderFunctionArgs) => {
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

  const { data: deliveries, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("*")
    .eq("shipment", params.shipment!);

  if (deliveriesError) {
    console.error(
      `shipmentDetails | deliveriesError: ${deliveriesError.message}`
    );
  }

  return json({ references, deliveries });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
    case "message": {
      sendMessage(formData, parseInt(params.shipment!));
      return redirect(`/dashboard/shipments/${params.shipment}`);
    }
    case "editReference": {
      const { error } = await supabase
        .from("references")
        .update({
          description: formData.get("description") as string,
          notes: formData.get("notes") as string,
          shipping: parseInt(formData.get("shipping") as string),
          clearance: parseInt(formData.get("clearance") as string),
        })
        .eq("id", formData.get("reference") as string)
        .single();
      if (error) {
        console.error(`shipmentDetails | editReferenceError: ${error.message}`);
      }
      return redirect(`/dashboard/shipments/${params.shipment!}`, {
        headers: { "X-Remix-Reload-Document": "true" },
      });
    }
  }
  return null;
};

export default function Shipment() {
  const { references } = useLoaderData<typeof loader>();
  const { shipment, view } = useOutletContext<{
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
    view: ComboboxItem;
  }>();

  const referenceData = (references ?? []).map((reference) => ({
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
    notes: reference.notes,
    paid: reference.paid,
    received: reference.received,
    packages: reference.packages,
    total_weight: reference.total_weight,
    small: reference.small,
    large: reference.large,
    shipping: reference.shipping,
    clearance: reference.clearance,
  }));

  const component = (view: ComboboxItem) => {
    switch (view.value) {
      case "shipment":
        return (
          <ShipmentTable
            data={referenceData}
            method={shipment?.method}
            edit={false}
          />
        );
      case "delivery":
        return <p>Work in Progress</p>;
      case "message":
        return <MessageCard />;
      default:
        return <></>;
    }
  };

  return <>{shipment && referenceData ? component(view) : <></>}</>;
}
