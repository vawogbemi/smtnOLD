import { Button, Card, Group, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ActionFunctionArgs } from "@remix-run/node";
import { redirect, useSubmit } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  const { data: forms, error: formError } = await supabase
    .from("forms")
    .insert({
      name: formData.get("name") as string,
      from: formData.get("from") as string,
      to: formData.get("to") as string,
    })
    .select();

  if (formError) {
    console.log(`dashboard/forms/new | formError: ${formError.message}`);
  }

  const { error: shipmentError } = await supabase.from("shipments").insert({
    form: forms?.at(0)?.id as number,
  });

  if (shipmentError) {
    console.log(
      `dashboard/forms/new | shipmentError: ${shipmentError.message}`
    );
  }

  return redirect("/dashboard/forms");
};

export default function CreateNewForm() {
  const form = useForm({
    initialValues: {
      name: "",
      from: "",
      to: "",
    },
    validate: {
      name: (val) =>
        val.length < 100 ? null : "Length must be less than 100 characters",
      from: (val) =>
        val.length < 50 ? null : "Length must be less than 50 characters",
      to: (val) =>
        val.length < 50 ? null : "Length must be less than 50 characters",
    },
  });

  const submit = useSubmit();

  return (
    <Card withBorder radius="md" maw={1250} mx={"auto"}>
      <Title order={1}>Create New Form</Title>
      <form
        onSubmit={form.onSubmit((values) => submit(values, { method: "post" }))}
      >
        <Stack>
          <TextInput
            required
            label="Name"
            placeholder="Toronto to Lagos | Air Cargo"
            {...form.getInputProps("name")}
          />
          <TextInput
            required
            label="From"
            placeholder="Toronto"
            {...form.getInputProps("from")}
          />
          <TextInput
            required
            label="To"
            placeholder="Lagos"
            {...form.getInputProps("to")}
          />
        </Stack>
        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl">
            Create New Form
          </Button>
        </Group>
      </form>
    </Card>
  );
}
