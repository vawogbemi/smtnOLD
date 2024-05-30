import {
  ActionIcon,
  TextInput,
  TextInputProps,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLocation, useSubmit } from "@remix-run/react";
import { IconArrowRight, IconBox } from "@tabler/icons-react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  return redirect(formData.get("reference") as string);
};

function InputWithButton(props: TextInputProps) {
  const theme = useMantineTheme();

  return (
    <TextInput
      radius="xl"
      size="md"
      placeholder="Tracking Number"
      mt={{ base: 100, sm: 100 }}
      rightSectionWidth={42}
      leftSection={
        <IconBox style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
      }
      rightSection={
        <ActionIcon
          type="submit"
          size={32}
          radius="xl"
          color={theme.primaryColor}
          variant="filled"
        >
          <IconArrowRight
            style={{ width: rem(18), height: rem(18) }}
            stroke={1.5}
          />
        </ActionIcon>
      }
      {...props}
    />
  );
}

export default function Tracking() {
  const path = useLocation().pathname.split("/");

  const form = useForm({
    initialValues: {
      reference: path.length > 2 ? path.at(2)! : "",
    },
  });

  const submit = useSubmit();

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) => submit(values, { method: "post" }))}
      >
        <InputWithButton
          w={{ md: 900 }}
          mx={"auto"}
          {...form.getInputProps("reference")}
        />
      </form>
      <Outlet />
    </>
  );
}
