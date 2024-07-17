import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  Title,
  Text,
  Grid,
  Table,
  ScrollArea,
  Anchor,
  Stack,
  Flex,
} from "@mantine/core";
import { supabaseServiceRoleClient } from "~/api/server";
import { IconCheck, IconX } from "@tabler/icons-react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("*, forms (*)")
    .eq("id", params.shipment!)
    .single();

  if (error) {
    throw new Response("Not Found", { status: 404 });
  }
  const { data: deliveries, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("*")
    .eq("shipment", params.shipment!)
    .order("id", { ascending: true });

  if (deliveriesError) {
    console.error(
      `deliveryDetails | referencesError: ${deliveriesError.message}`
    );
  }

  return json({ shipment, deliveries });
};

function DeliveryTable(props: {
  deliveries: {
    address_1: string;
    address_2: string;
    city: string;
    country: string;
    created_at: string;
    customer_3: number | null;
    customer_4: number | null;
    customer_5: number | null;
    id: number;
    paid: boolean | null;
    postal_zip_code: string | null;
    province_state: string | null;
    receiver: number | null;
    reference: number;
    sender: number | null;
    tracking: string | null;
  }[];
}) {
  const { deliveries } = props;

  const rows = deliveries.map((row, index) => (
    <Table.Tr key={row.id}>
      <Table.Td align="left">{index + 1}</Table.Td>
      <Table.Td align="left">
        <Anchor href={`/dashboard/references/${row.id}`}> {row.id} </Anchor>
      </Table.Td>
      <Table.Td align="left">
        {row.paid ? (
          <IconCheck size={10} color="green" />
        ) : (
          <IconX size={10} color="red" />
        )}
      </Table.Td>
      <Table.Td align="left">{row.tracking}</Table.Td>
      <Table.Td align="left">
        <Anchor href={`/dashboard/customers/${row.sender}`}>
          {row.sender}
        </Anchor>
      </Table.Td>
      <Table.Td align="left">
        <Anchor href={`/dashboard/customers/${row.receiver}`}>
          {row.receiver}
        </Anchor>
      </Table.Td>
      <Table.Td align="left">
        {[
          row.province_state,
          row.city,
          row.postal_zip_code,
          row.address_1,
          row.address_2,
          row.country,
        ].join(",")}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={300}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Number</Table.Th>
            <Table.Th>Delivery</Table.Th>
            <Table.Th>Delivery Paid</Table.Th>
            <Table.Th>Tracking</Table.Th>
            <Table.Th>Sender</Table.Th>
            <Table.Th>Receiver</Table.Th>
            <Table.Th>Full Address</Table.Th>
          </Table.Tr>
        </Table.Thead>
        {rows.length > 0 ? (
          <Table.Tbody>{rows}</Table.Tbody>
        ) : (
          <Table.Td colSpan={7}>
            <Text fw={500} ta="center">
              Nothing found
            </Text>
          </Table.Td>
        )}
      </Table>
    </ScrollArea>
  );
}

function ShipmentDetails(props: {
  shipment: {
    boxes: number;
    created_at: string;
    form: number;
    id: number;
    last_updated: string;
    status: number;
    forms: {
      created_at: string;
      from: string;
      id: number;
      name: string;
      shipments: number;
      to: string;
    } | null;
  };
}) {
  const { shipment } = props;

  return (
    <Card>
      <Grid mb={10}>
        <Grid.Col span={4}>
          <Title order={4}>Status</Title>
          <Text>{shipment.status}</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Title order={4}>Form</Title>
          <Text>{`${shipment.forms?.name}`}</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Title order={4}>Created</Title>
          <Text>{new Date(shipment!.created_at).toLocaleString()}</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Title order={4}>Boxes</Title>
          <Text>{`${shipment?.boxes}`}</Text>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

export default function Shipment() {
  const { shipment, deliveries } = useLoaderData<typeof loader>();

  return (
    <Card withBorder radius="md" px={{ md: 200, lg: 300, xl: 400 }}>
      {" "}
      <Flex>
        <Stack mb={"lg"}>
          <Title order={1}>Shipment</Title>
          <Title
            order={3}
            c={"gray"}
            mt={-20}
            mb={-10}
          >{`#${shipment.id}`}</Title>
        </Stack>
      </Flex>
      <ShipmentDetails shipment={shipment} />
      <Title order={3} mt={20}>
        {" "}
        Deliveries{" "}
      </Title>
      <DeliveryTable deliveries={deliveries ?? []} />
    </Card>
  );
}
