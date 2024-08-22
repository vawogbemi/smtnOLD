import { Button, Card, Group, Title } from "@mantine/core";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Outlet,
  useActionData,
  useLocation,
  useOutletContext,
} from "@remix-run/react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { useState } from "react";
import {
  createReceiever,
  createReference,
  sendSms,
  supabaseServiceRoleClient,
} from "~/api/server";
import { LoginCard } from "~/components/LoginCard/LoginCard";
import { NewReferenceForm } from "~/components/NewReference/NewReferenceForm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  if (formData.get("action") === "queryCustomer") {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", formData.get("phone") as string);

    if (error) {
      console.error(`dashboard | queryCustomerError: ${error.message}`);
    }

    if (data && data.length > 0) {
      return json(data[0]);
    }

    return null;
  }

  if (formData.get("action") === "createCustomer") {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        phone: formData.get("phone") as string,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
      })
      .select("*");

    if (error) {
      console.error(`dashboard | createCustomerError: ${error.message}`);
    }

    if (data && data.length > 0) {
      return json(data[0]);
    }

    return null;
  }

  if (formData.get("action") === "submit") {

    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", formData.get("phone") as string);

    const customer = customers?.at(0);

    if (customersError) {
      console.error(`dashboard | customersError: ${customersError.message}`);
    }

    const { data: shipments, error: shipmentError } = await supabase
      .from("shipments")
      .select("*")
      .eq("from", formData.get("from") as string)
      .eq("to", formData.get("to") as string)
      .eq("method", formData.get("method") as string)
      .eq("status", 0)
      .order("id", { ascending: false })
      .limit(1);

    const shipment = shipments?.at(0);

    if (shipmentError) {
      console.error(`dashboard | shipmentError: ${shipmentError.message}`);
    }

    const receiver = await createReceiever(
      formData.get("receiver_name") as string,
      formData.get("receiver_phone") as string
    );

    if (!shipment) {
      const { data: newShipments, error: newShipmentError } = await supabase
        .from("shipments")
        .insert({
          from: formData.get("from") as string,
          to: formData.get("to") as string,
          method: formData.get("method") as string,
          packages: 0,
          status: 0,
        })
        .select("*");

      if (newShipmentError) {
        console.error(
          `dashboard | newShipmentError: ${newShipmentError.message}`
        );
      }

      const newShipment = newShipments?.at(0);

      const references = await createReference(
        newShipment!.id,
        formData.get("description") as string,
        formData.get("notes") as string,
        formData.get("method") === "air"
          ? parseInt(formData.get("number_of_boxes") as string)
          : parseInt(formData.get("small") as string) +
              parseInt(formData.get("large") as string),
        formData.get("method") === "air"
          ? parseInt(formData.get("total_weight") as string)
          : 0,
        formData.get("method") === "ocean"
          ? parseInt(formData.get("small") as string)
          : 0,
        formData.get("method") === "ocean"
          ? parseInt(formData.get("large") as string)
          : 0,
        formData.get("paid") === "true",
        customer!.id,
        receiver!.at(0)!.id,
        parseInt(formData.get("shipping") as string),
        parseInt(formData.get("clearance") as string),
      );

      const reference = references?.at(0);
      console.log(reference);
      if (formData.get("method") === "air") {
        const boxes = [
          ...Array(parseInt(formData.get("number_of_boxes") as string)).keys(),
        ].map((i) => ({
          number: shipment!.packages + i + 1,
          reference: reference!.id,
          length: parseInt(formData.get(`length_${i + 1}`) as string),
          width: parseInt(formData.get(`width_${i + 1}`) as string),
          height: parseInt(formData.get(`height_${i + 1}`) as string),
          weight: parseInt(formData.get(`weight_${i + 1}`) as string),
        }));

        const { error: boxesError } = await supabase
          .from("boxes")
          .insert(boxes);

        if (boxesError) {
          console.log(`dashboard | boxesError: ${boxesError.message}`);
        }
      }

      const { error: incrementError } = await supabase.rpc("increment", {
        table_name: "shipments",
        row_id: newShipment!.id,
        x:
          formData.get("method") === "air"
            ? parseInt(formData.get("number_of_boxes") as string)
            : parseInt(formData.get("small") as string) +
              parseInt(formData.get("large") as string),
        field_name: "packages",
      });

      if (incrementError) {
        console.log(incrementError);
      }
      const body =
        `Your reference has been created` +
        "\n\n" +
        "Track your package(s) here: https://www.smtninternational.com/tracking/" +
        reference!.id +
        "\n\n" +
        "Thank you for choosing SMTN International!" +
        "\n\n" +
        "DO NOT REPLY TO THIS NUMBER";
      sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: formData.get("phone") as string,
        body,
      }).catch((err) => console.log(err));
      sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: formData.get("receiver_phone") as string,
        body,
      }).catch((err) => console.log(err));
      return redirect(`/dashboard/references/${reference!.id}`);
    } else {
      const references = await createReference(
        shipment.id,
        formData.get("description") as string,
        formData.get("notes") as string,
        formData.get("method") === "air"
          ? parseInt(formData.get("number_of_boxes") as string)
          : parseInt(formData.get("small") as string) +
              parseInt(formData.get("large") as string),
        formData.get("method") === "air"
          ? parseInt(formData.get("total_weight") as string)
          : 0,
        formData.get("method") === "ocean"
          ? parseInt(formData.get("small") as string)
          : 0,
        formData.get("method") === "ocean"
          ? parseInt(formData.get("large") as string)
          : 0,
        formData.get("paid") === "true",
        customer!.id,
        receiver!.at(0)!.id,
        parseInt(formData.get("shipping") as string),
        parseInt(formData.get("clearance") as string),
      );

      const reference = references?.at(0);

      if (formData.get("method") === "air") {
        const boxes = [
          ...Array(parseInt(formData.get("number_of_boxes") as string)).keys(),
        ].map((i) => ({
          number: shipment!.packages + i + 1,
          reference: reference!.id,
          length: parseInt(formData.get(`length_${i + 1}`) as string),
          width: parseInt(formData.get(`width_${i + 1}`) as string),
          height: parseInt(formData.get(`height_${i + 1}`) as string),
          weight: parseInt(formData.get(`weight_${i + 1}`) as string),
        }));

        const { error: boxesError } = await supabase
          .from("boxes")
          .insert(boxes);

        if (boxesError) {
          console.log(`dashboard | boxesError: ${boxesError.message}`);
        }
      }

      const { error: incrementError } = await supabase.rpc("increment", {
        table_name: "shipments",
        row_id: shipment!.id,
        x:
          formData.get("method") === "air"
            ? parseInt(formData.get("number_of_boxes") as string)
            : parseInt(formData.get("small") as string) +
              parseInt(formData.get("large") as string),
        field_name: "packages",
      });

      if (incrementError) {
        console.log(incrementError);
      }
      const body =
        `Your reference has been created` +
        "\n\n" +
        "Track your package(s) here: https://www.smtninternational.com/tracking/" +
        reference!.id +
        "\n\n" +
        "Thank you for choosing SMTN International!" +
        "\n\n" +
        "DO NOT REPLY TO THIS NUMBER";
      sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: formData.get("phone") as string,
        body,
      }).catch((err) => console.log(err));
      sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: formData.get("receiver_phone") as string,
        body,
      }).catch((err) => console.log(err));
      return redirect(`/dashboard/references/${reference!.id}`);
    }
  }

  return null;
};

export default function Dashboard() {
  const { user, supabase } = useOutletContext<{
    user: User;
    supabase: SupabaseClient;
  }>();

  const [createReference, toggleCreateReference] = useState(false);
  const actionData = useActionData<typeof action>();
  const location = useLocation();


  return user ? (
    <>
      <Group justify="right" mb={10}>
        <Button onClick={() => toggleCreateReference((prev) => !prev)}>
          {createReference ? "Cancel" : "Create Reference"}
        </Button>
      </Group>
      <Card withBorder radius="md">
        {createReference ? (
          <NewReferenceForm data={actionData} toggleCreateReference={toggleCreateReference} />
        ) : location.pathname == "/dashboard" ||
          location.pathname == "/dashboard/" ? (
          <>
            <Title order={1}>Dashboard</Title>
          </>
        ) : (
          <Outlet/>
        )}
      </Card>
    </>
  ) : (
    <LoginCard supabase={supabase} />
  );
}
