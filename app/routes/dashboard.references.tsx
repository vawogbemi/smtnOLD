import { Card, Group, Input, Stack, Text, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { supabaseServiceRoleClient } from "~/api/server";

export const loader = async () => {
  const supabase = supabaseServiceRoleClient();

  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select("*, forms (*)")
    .order("id", { ascending: true });

  if (referencesError) {
    console.log(
      `dashboard/references | referencesError: ${referencesError.message}`
    );
  }

  return json({ references });
};

export default function References() {
  const { references } = useLoaderData<typeof loader>();

  const location = useLocation();

  const [filter, setFilter] = useState("");

  return location.pathname == "/dashboard/references/" ||
    location.pathname == "/dashboard/references" ? (
    <Card withBorder radius="md" maw={1250} mx={"auto"}>
      <Group>
        <Title order={1} mb={10}>
          References
        </Title>
        <Input
          ml={"auto"}
          w={400}
          placeholder="Filter"
          onChange={(e) => setFilter(e.target.value)}
        />
      </Group>

      {references?.length &&
        references
          ?.filter(
            (reference) =>
              reference.id.toString().includes(filter) ||
              reference.forms?.name
                .toLowerCase()
                .includes(filter.toLowerCase()) ||
              reference.shipment.toString().includes(filter)
          )
          .map((reference) => (
            <Card
              key={reference.id}
              component="a"
              href={`/dashboard/references/${reference.id}`}
              withBorder
              px={30}
              my={5}
              h={75}
            >
              <Group justify="space-between">
                <Stack align="center">
                  <Title order={5}>Form</Title>
                  <Text c={"gray"} mt={-15}>{`${reference.forms?.name}`}</Text>
                </Stack>
                <Stack align="center">
                  <Title order={5}>Shipment</Title>
                  <Text c={"gray"} mt={-15}>{`${reference.shipment}`}</Text>
                </Stack>
                <Stack align="center">
                  <Title order={5}>Reference</Title>
                  <Text c={"gray"} mt={-15}>{`${reference.id}`}</Text>
                </Stack>
                <Stack align="center">
                  <Title order={5}>Paid</Title>
                    {reference?.paid ? (
                      <IconCheck size={10} color="green" />
                    ) : (
                      <IconX size={10} color="red"/>
                    )}
                </Stack>
                <Stack align="center">
                  <Title order={5}>Received</Title>
                    {reference?.received ? (
                      <IconCheck size={10} color="green"/>
                    ) : (
                      <IconX size={10} color="red"/>
                    )}
                </Stack>
                <Stack align="center">
                  <Title order={5}>Delivery</Title>
                    {reference?.delivery ? (
                      <IconCheck size={10} color="green"/>
                    ) : (
                      <IconX size={10} color="red"/>
                    )}
                </Stack>
                <Stack align="center">
                  <Title order={5}>Boxes</Title>
                  <Text c={"gray"} mt={-15}>{`${reference.boxes}`}</Text>
                </Stack>
              </Group>
            </Card>
          ))}
    </Card>
  ) : (
    <Outlet />
  );
}
