import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";
import { Button, Card, Group, Stack, Text, Timeline, Title } from "@mantine/core";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: references } = await supabase
    .from("references")
    .select(
      "id, forms (from, to), shipment, shipments (status, last_updated), paid, received, delivery, total_weight, amount_paid, created_at"
    )
    .eq("id", params.reference!);

  if (references && references?.length > 0) {
    return json({
      reference: references!.at(0),
    });
  }

  return redirect("/404");
};

export default function TrackingReference() {
  const { reference } = useLoaderData<typeof loader>();

  return (
    <Stack mt={75}>
      <Card>
        <Title order={1}>{reference?.id}</Title>
      </Card>
      <Timeline
        active={reference?.shipments?.status}
        bulletSize={24}
        lineWidth={2}
      >
        <Timeline.Item title={`${reference?.forms?.from}`}>
          <Text c="dimmed" size="sm">
            Label Created
          </Text>
          <Text size="xs" mt={4}>
            {reference?.created_at}
          </Text>
        </Timeline.Item>

        <Timeline.Item title="Shipment Confirmed">
          <Text c="dimmed" size="sm">
            No more packages can be added
          </Text>
          {reference?.shipments?.status == 1 && (
            <Text size="xs" mt={4}>
              title={`${reference?.shipments?.last_updated}`}
            </Text>
          )}
        </Timeline.Item>

        <Timeline.Item title="In Transit" lineVariant="dashed">
          <Text c="dimmed" size="sm">
            Package is in transit
          </Text>
          {reference?.shipments?.status == 1 && (
            <Text size="xs" mt={4}>
              title={`${reference?.shipments?.last_updated}`}
            </Text>
          )}
        </Timeline.Item>

        <Timeline.Item title={`${reference?.forms?.to}`}>
          <Text c="dimmed" size="sm">
            {" "}
            left a code review on your pull request
          </Text>
          {reference?.shipments?.status == 1 && (
            <Text size="xs" mt={4}>
              {" "}
              title={`${reference?.shipments?.last_updated}`}
            </Text>
          )}
        </Timeline.Item>
      </Timeline>
      <Group>
        <Button>
          Request Delivery
        </Button>
      </Group>
    </Stack>
  );
}
