import { Button, Card, Group, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLocation, useSubmit } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";
import { PhoneSelect } from "~/components/PhoneSelect/PhoneSelect";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  const { error: customerError } = await supabase.from("customers").insert({
    phone: formData.get("phone") as string,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  });

  if (customerError) {
    console.error(customerError);
  }

  return redirect("/dashboard/customers");
};

export default function NewCustomer() {
  const form = useForm({
    initialValues: {
      phone: "",
      name: "",
      email: "",
    },
    validate: {
      phone: (val) =>
        location.pathname == "/dashboard/customers/new" ||
        location.pathname == "/dashboard/customers/new/"
          ? /^\+\d+$/.test(val)
            ? val.length > 5
              ? null
              : "Length must be greater than 5 characters"
            : "Phone number is missing country code"
          : null,
    },
  });

  const submit = useSubmit();

  const location = useLocation();

  return (
    <Card withBorder radius="md" px={{ md: 200, lg: 300, xl: 400 }}>
      <Stack mb={"lg"}>
        <Title order={1} mb={-10}>{`New Customer Form`}</Title>
      </Stack>
      <form
        onSubmit={form.onSubmit((values) =>
          submit(values, { action: location.pathname, method: "post" })
        )}
      >
        <Stack>
          {location.pathname == "/dashboard/customers/new" ||
          location.pathname == "/dashboard/customers/new/" ? (
            <PhoneSelect
              {...form.getInputProps("phone")}
              onChange={(value) => form.setFieldValue("phone", value)}
            />
          ) : (
            <></>
          )}

          <TextInput
            required
            label="Name"
            description="Name of the customer"
            placeholder="Burna Kid"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Email"
            description="Email of the customer"
            placeholder="Burnaboyhadawizkid@davido.com"
            {...form.getInputProps("email")}
          />
        </Stack>
        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl">
            Submit
          </Button>
        </Group>
      </form>
    </Card>
  );
}
