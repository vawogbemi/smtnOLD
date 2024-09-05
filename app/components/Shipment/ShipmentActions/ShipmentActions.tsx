import { Button, Group, Select, ComboboxItem } from "@mantine/core";
import { useSubmit } from "@remix-run/react";
import { statusToString } from "~/utils/helper";

interface ShipmentActionsProps {
  currentShipmentId: number | null;
  currentShipmentStatus: number | null;
  state: {
    from: ComboboxItem;
    to: ComboboxItem;
    method: ComboboxItem;
    view: ComboboxItem;
  };
  dispatch: React.Dispatch<{
    type: string;
    item?: ComboboxItem;
  }>;
}

export function ShipmentActions({
  currentShipmentId,
  currentShipmentStatus,
  state,
  dispatch,
}: ShipmentActionsProps) {
  const viewOptions = [
    { value: "shipment", label: "Shipment" },
    { value: "delivery", label: "Delivery" },
    { value: "message", label: "Message" },
  ];
  const submit = useSubmit();
  return (
    <>
      <Group>
        <Select
          disabled={!currentShipmentId}
          data={viewOptions}
          value={state.view.value}
          onChange={(value) =>
            value && dispatch({ type: "view", item: { value, label: value } })
          }
          label="View"
        />
        <Group mb={-22.5}>
          <Button
            disabled={!currentShipmentId}
            onClick={() => {
              submit(
                { action: "manifest", shipment: currentShipmentId },
                { method: "post" }
              );
            }}
          >
            Print Manifest
          </Button>
          <Button
            disabled={!currentShipmentId || currentShipmentStatus === 4}
            onClick={() =>
              submit(
                {
                  action: "status",
                  shipment: currentShipmentId,
                  status: currentShipmentStatus ?? -2,
                },
                { method: "post" }
              )
            }
          >
            Next Status: {statusToString((currentShipmentStatus ?? -2) + 1)}
          </Button>
        </Group>
      </Group>
    </>
  );
}
