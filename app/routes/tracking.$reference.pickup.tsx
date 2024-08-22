import {
  json,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import { Button, Stack, Title } from "@mantine/core";
import { Reference } from "./tracking.$reference";
import { supabaseServiceRoleClient } from "~/api/server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { IconCheck } from "@tabler/icons-react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  await supabase
    .from("references")
    .update({ received: true })
    .eq("id", parseInt(formData.get("reference") as string));

  return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: boxes } = await supabase
    .from("boxes")
    .select("*")
    .eq("reference", params.reference!);

  return json({ boxes });
};

export default function Pickup() {
  const { boxes } = useLoaderData<typeof loader>();
  const { reference } = useOutletContext<{ reference: Reference }>();

  const [pickedUp, setPickedUp] = useState(reference.received);
  const submit = useSubmit();

  return (
    <Stack align="center" mt={75}>
      <Title order={4}>{reference.receivers?.name ?? "Unknown"}</Title>
      <Title order={1}>Boxes</Title>
      <Title order={1}>
        {boxes && boxes?.length > 1
          ? `${boxes?.at(0)?.number} - ${boxes?.at(-1)?.number ?? ""}`
          : boxes?.at(0)?.number}
      </Title>
      <Title order={4} c={reference.paid ? "green" : "red"}>
        {reference.paid ? "Paid" : "Not Paid"}
      </Title>
      {reference.paid ? (
        <></>
      ) : (
        <>
          <Title order={5}>Amount Owed</Title>
          <Title
            order={6}
          >{`Shipping: ${reference.shipping} Clearance: ${reference.clearance}`}</Title>
        </>
      )}
      {pickedUp ? (
        <Stack mt={50}>
          <IconCheck color="green" size={75} />
          <Title order={4}>Picked Up</Title>
        </Stack>
      ) : (
        <Button
          mt={50}
          onClick={() => (
            submit({ reference: reference.id }, { method: "post" }),
            setPickedUp((prev) => !prev)
          )}
        >
          Mark as Picked Up
        </Button>
      )}
      <Button mt={50} component="a" href={`/tracking/${reference.id}`}>
        Back to Tracking
      </Button>
    </Stack>
  );
}
