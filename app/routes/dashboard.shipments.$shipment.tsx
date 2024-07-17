import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  Title,
  Text,
  Grid,
  Stack,
  Flex,
  Group,
  Button,
} from "@mantine/core";
import { supabaseServiceRoleClient } from "~/api/server";
import { ReferenceTable } from "~/components/ReferenceTable";

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
  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select("*")
    .eq("shipment", params.shipment!)
    .order("id", { ascending: true });

  if (referencesError) {
    console.error(
      `shipmentDetails | referencesError: ${referencesError.message}`
    );
  }

  return json({ shipment, references });
};

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
  const { shipment, references } = useLoaderData<typeof loader>();

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
        <Group ml={"auto"}>
          <Button>Print Manifest</Button>
          <Button>Send Sms</Button>
        </Group>
      </Flex>
      <ShipmentDetails shipment={shipment} />
      <Title order={3} mt={20}>
        {" "}
        References{" "}
      </Title>
      <ReferenceTable references={references ?? []} />
    </Card>
  );
}
