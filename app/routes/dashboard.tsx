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
  createCustomer,
  getCustomer,
  getOrCreateCustomer,
} from "~/api/customer";
import { createReferenceAndBoxes } from "~/api/reference";
import { sendConfirmation } from "~/api/send";
import { createReceiever } from "~/api/receiver";
import { getOrCreateShipment, updateShipmentPackages } from "~/api/shipment";
import { LoginCard } from "~/components/Misc/LoginCard/LoginCard";
import { NewReferenceForm } from "~/components/NewReference/NewReferenceForm";

async function submitReference(formData: FormData) {
  const customer = await getOrCreateCustomer(formData, "phone");
  if (!customer) return null;

  const shipment = await getOrCreateShipment(formData);
  if (!shipment) return null;

  const receiver = await createReceiever(
    formData
  );
  if (!receiver) return null;

  const reference = await createReferenceAndBoxes(
    formData,
    shipment,
    customer,
    receiver[0]
  );
  if (!reference) return null;

  await updateShipmentPackages(shipment, formData);
  await sendConfirmation(formData, reference);

  return redirect(`/dashboard/references/${reference.id}`);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  switch (action) {
    case "queryCustomer":
      return json(await getCustomer(formData, "phone"));
    case "createCustomer":
      return json(await createCustomer(formData));
    case "submit":
      return await submitReference(formData);
    default:
      return null;
  }
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
      <Group justify="right" mt={-25} mb={10}>
        <Button onClick={() => toggleCreateReference((prev) => !prev)}>
          {createReference ? "Cancel" : "Create Reference"}
        </Button>
      </Group>
      <Card withBorder radius="md">
        {createReference ? (
          <NewReferenceForm
            data={actionData}
            toggleCreateReference={toggleCreateReference}
          />
        ) : location.pathname == "/dashboard" ||
          location.pathname == "/dashboard/" ? (
          <>
            <Title order={1}>Dashboard</Title>
          </>
        ) : (
          <Outlet />
        )}
      </Card>
    </>
  ) : (
    <LoginCard supabase={supabase} />
  );
}
