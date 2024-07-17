import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";
import {
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: references } = await supabase
    .from("references")
    .select("*, forms (name, from, to), shipments (status, last_updated)")
    .eq("id", params.reference!);

  if (references && references?.length > 0) {
    return json({
      reference: references!.at(0),
    });
  }

  return redirect("/404");
};

type Reference = {
  id: number;
  amount_paid: number;
  boxes: number | null;
  created_at: string;
  customer_3: number | null;
  customer_4: number | null;
  customer_5: number | null;
  delivery: boolean;
  description: string;
  form: number;
  notes: string;
  paid: boolean;
  received: boolean;
  receiver: number | null;
  sender: number | null;
  shipment: number;
  total_weight: number;
  forms: {
    name: string;
    from: string;
    to: string;
  } | null;
  shipments: {
    status: number;
    last_updated: string;
  } | null;
};

function TrackingReferenceCard(props: { reference: Reference | undefined }) {
  const { reference } = props;

  const [details, showDetails] = useState(false);

  return (
    <Stack align="center" mt={75}>
      <Card>
        <Title order={1}>Reference</Title>
        <Title order={3} c={"gray"}>
          #{reference!.id}
        </Title>
      </Card>
      <Button onClick={() => showDetails(!details)} mb={10}>
        Reference Details
      </Button>
      {details && (
        <Card>
          <Grid mb={10}>
            <Grid.Col span={4}>
              <Title order={4}>Form</Title>
              <Text>{`${reference?.forms?.name}`}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Shipment</Title>
              <Text>{`${reference?.shipment}`}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Created</Title>
              <Text> {new Date(reference!.created_at).toLocaleString()}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Boxes</Title>
              <Text>{`${reference?.boxes}`}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Total Weight</Title>
              <Text>{`${reference?.total_weight} kg`}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Paid</Title>
              {reference?.paid ? (
                <IconCheck size={10} color="green" />
              ) : (
                <IconX size={10} color="red" />
              )}
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Recieved</Title>
              {reference?.received ? (
                <IconCheck size={10} color="green" />
              ) : (
                <IconX size={10} color="red" />
              )}
            </Grid.Col>
            <Grid.Col span={4}>
              <Title order={4}>Delivery</Title>
              {reference?.delivery ? (
                <IconCheck size={10} color="green" />
              ) : (
                <IconX size={10} color="red" />
              )}
            </Grid.Col>
          </Grid>
        </Card>
      )}

      <Timeline
        active={reference?.shipments?.status}
        bulletSize={24}
        lineWidth={2}
      >
        <Timeline.Item title="Label Created" bullet>
          <Text c="dimmed" size="sm">
            {reference?.forms?.from}
          </Text>
          <Text size="xs" mt={4}>
            {reference?.shipments?.status == 0 && (
              <Text size="xs" mt={4}>
                {new Date(reference?.shipments?.last_updated).toLocaleString()}
              </Text>
            )}
          </Text>
        </Timeline.Item>

        <Timeline.Item title="Shipment Confirmed" bullet>
          <Text c="dimmed" size="sm">
            No more packages can be added
          </Text>
          {reference?.shipments?.status == 1 && (
            <Text size="xs" mt={4}>
              {new Date(reference?.shipments?.last_updated).toLocaleString()}
            </Text>
          )}
        </Timeline.Item>

        <Timeline.Item title="In Transit" bullet>
          <Text c="dimmed" size="sm">
            Package is in transit
          </Text>
          {reference?.shipments?.status == 2 && (
            <Text size="xs" mt={4}>
              {new Date(reference?.shipments?.last_updated).toLocaleString()}
            </Text>
          )}
        </Timeline.Item>

        <Timeline.Item title="Arrived" bullet>
          <Text c="dimmed" size="sm">
            {reference?.forms?.to}
          </Text>
          {reference?.shipments?.status == 3 && (
            <Text size="xs" mt={4}>
              {" "}
              {new Date(reference?.shipments?.last_updated).toLocaleString()}
            </Text>
          )}
        </Timeline.Item>
      </Timeline>
      <Group>
        <Stack>
          <Group>
            <Button component="a" href={`/tracking/${reference!.id}/pickup`}>
              Confirm Pickup
            </Button>
            <Button component="a" href={`/tracking/${reference!.id}/delivery`}>
              Request Delivery
            </Button>
          </Group>
          <Button disabled onClick={() => alert("oh so you think u smart?")}>
            Get Updates
          </Button>
        </Stack>
      </Group>
    </Stack>
  );
}

export default function TrackingReference() {
  const { reference } = useLoaderData<typeof loader>();
  const location = useLocation();
  return location.pathname.split("/").length == 3 ? (
    <TrackingReferenceCard reference={reference} />
  ) : (
    <Outlet context={{ reference }} />
  );
}
