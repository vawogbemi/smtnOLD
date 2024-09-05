import {
  Button,
  ComboboxItem,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { supabase } from "~/api/supabase";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
};

export const loader = async ({ params }: LoaderFunctionArgs) => {

  const { data } = await supabase
    .from("deliveries")
    .select("*, references (partner)")
    .eq("reference", params.reference!);

  return json({ delivery: data?.at(0) });
};

export default function TrackingReferenceDelivery() {
  const [type, setType] = useState<ComboboxItem>({
    value: "courier",
    label: "courier",
  });

  const { delivery } = useLoaderData<typeof loader>();

  return (
    <Stack align="center" mt={75}>
      <Title order={1}>Request Delivery</Title>
      {delivery ? (
        <></>
      ) : (
        <form>
          <Select
            data={[
              { value: "courier", label: "Courier" },
              { value: "uber", label: "Uber" },
              { value: "driver", label: "Driver" },
            ]}
            value={type ? type.value : undefined}
            onChange={(_, option) =>
              option.value == type.value ? null : setType(option)
            }
            my={15}
            label="Type"
          ></Select>
          {type.value == "courier" &&
            <TextInput label="Address" w={300} my={15}></TextInput>
          }
          <Textarea label="Notes" my={15}></Textarea>
          <Button type="submit" w={300} my={15} mx={"auto"}>
            Submit
          </Button>
        </form>
      )}
    </Stack>
  );
}
