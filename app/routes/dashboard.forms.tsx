import {
  Button,
  ButtonGroup,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";

export const loader = async () => {
  const supabase = supabaseServiceRoleClient();

  const { data: forms } = await supabase.from("forms").select();

  return { forms };
};

export default function Forms() {
  const { forms } = useLoaderData<typeof loader>();
  const location = useLocation();

  const items = forms?.map((form) => (
    <Button
      component="a"
      href={`${location.pathname}/${form.id}`}
      key={form.id}
      w={"1/3"}
      h={250}
      c={"dark.9"}
      bg={"gray.0"}
    >
      <Stack>
        <Title order={1} c={"dark.3"} size="xs">
          {`Form ${form.id}`}
        </Title>
        <Title order={4}>{form.name}</Title>
      </Stack>
    </Button>
  ));

  return location.pathname == "/dashboard/forms" ||
    location.pathname == "/dashboard/forms/" ? (
    <Card withBorder radius="md">
      <Group justify="space-between">
        <Text size="xl">Forms</Text>
        <ButtonGroup>
          <Button component="a" href={`${location.pathname}/new`}>
            New Form
          </Button>
        </ButtonGroup>
      </Group>
      <SimpleGrid cols={{ sm: 1, md: 3 }} mt="md">
        {items}
      </SimpleGrid>
    </Card>
  ) : (
    <Outlet context={{ forms }} />
  );
}
