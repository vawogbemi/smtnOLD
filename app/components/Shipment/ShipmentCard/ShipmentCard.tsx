import { Card, Group, Stack, Text } from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { statusToString } from "~/utils/helper";

type ShipmentCardProps = {
  shipment: {
    created_at: string;
    from: string;
    id: number;
    last_updated: string;
    method: string;
    packages: number;
    status: number;
    to: string;
  };
  isSelected: boolean;
}

export function ShipmentCard({ shipment, isSelected }: ShipmentCardProps) {
  return (
    <Card
      component="a"
      href={`/dashboard/shipments/${shipment.id}`}
      withBorder
      style={{
        borderRadius: isSelected ? "1px" : "0px",
        borderLeft: "0px",
        borderRight: "0px",
        borderTop: "0px",
        backgroundColor: isSelected ? "#dee2e6" : "white",
      }}
      styles={{
        root: {
          ":hover": {
            bg: "#dee2e6",
          },
        },
      }}
      w={350}
      px={20}
      h={75}
    >
      <Stack>
        <Group>
          <Text c="gray" size="sm">
            {upperFirst(shipment.from)}
          </Text>
          <Text c="gray" size="sm">
            {upperFirst(shipment.to)}
          </Text>
          <Text c="gray" size="sm">
            {upperFirst(shipment.method)}
          </Text>
        </Group>
        <Group mt={-20}>
          <Text>
            {new Date(shipment.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text>{shipment.packages} packages</Text>
          <Text>{statusToString(shipment.status)}</Text>
        </Group>
      </Stack>
    </Card>
  );
}
