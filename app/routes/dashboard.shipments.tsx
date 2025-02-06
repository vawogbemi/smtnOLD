import {
  ComboboxItem,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Stack, Title
} from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Outlet,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { useEffect, useReducer } from "react";
import { sendSms } from "~/api/twilio";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "~/api/supabase";
import { ShipmentFilters } from "~/components/Shipment/ShipmentFilters/ShipmentFilters";
import { ShipmentActions } from "~/components/Shipment/ShipmentActions/ShipmentActions";
import { ShipmentCard } from "~/components/Shipment/ShipmentCard/ShipmentCard";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  switch (formData.get("action")) {
    case "status": {
      await supabase
        .from("shipments")
        .update({
          status: parseInt(formData.get("status") as string) + 1,
          last_updated: new Date(Date.now()).toISOString(),
        })
        .eq("id", formData.get("shipment") as string);

      if (parseInt(formData.get("status") as string) === 3) {
        const { data: references, error: referencesError } = await supabase
          .from("references")
          .select("id, customers(name, phone), receivers(name, phone)")
          .eq("shipment", formData.get("shipment") as string);

        if (referencesError) {
          console.error(
            `dashboard/shipments | referencesError: ${referencesError.message}`
          );
          return null;
        }

        const body = (name: string, id: number) =>
          `Hello ${name},\n\n` +
          "Your package is ready for pickup.\n\n" +
          `Pickup: www.smtninternational.com/tracking/${id}/pickup\n\n` +
          "Thank you for choosing Smtn International.\n\n\n" +
          "DO NOT REPLY TO THIS NUMBER";

        references.forEach(async (reference) => {
          await sendSms({
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: reference?.customers?.phone ?? "",
            body: body(reference?.customers?.name ?? "", reference.id),
          });
          if (reference.customers?.phone !== reference.receivers?.phone) {
            await sendSms({
              from: process.env.TWILIO_PHONE_NUMBER!,
              to: reference?.receivers?.phone ?? "",
              body: body(reference?.receivers?.name ?? "", reference.id),
            });
          }
        });

        await supabase
          .from("shipments")
          .update({ status: parseInt(formData.get("status") as string) + 1 })
          .eq("id", formData.get("shipment") as string);
      }
      return null;
    }

    case "manifest": {
      const data = await supabase
        .from("boxes")
        .select(
          "id, number, length, width, height, weight, references(id, shipment, paid, total_weight, shipping, clearance, description, notes, customers (name, phone), receivers (name, phone))"
        )
        .not("references", "is", null)
        .eq("references.shipment", parseInt(formData.get("shipment") as string))
      return data;
    }
  }

  return null;
};

export const loader = async () => {
  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select("*")
    .order("id", { ascending: false });

  if (shipmentsError) {
    console.log(
      `dashboard/references | referencesError: ${shipmentsError.message}`
    );
  }

  return json({ shipments });
};

export default function Shipments() {
  const { shipments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const pathnames = useLocation().pathname.split("/");

  const reducer = (
    state: {
      from: ComboboxItem;
      to: ComboboxItem;
      method: ComboboxItem;
      view: ComboboxItem;
    },
    action: { type: string; item?: ComboboxItem }
  ) => {
    switch (action.type) {
      case "from":
        if (action.item) {
          if (
            action.item.value === state.to.value &&
            action.item.value !== "all"
          ) {
            return { ...state, from: action.item, to: state.from };
          } else {
            return { ...state, from: action.item };
          }
        }
        return state;
      case "to":
        if (action.item) {
          if (
            action.item.value === state.from.value &&
            action.item.value !== "all"
          ) {
            return { ...state, to: action.item, from: state.to };
          } else {
            return { ...state, to: action.item };
          }
        }
        return state;
      case "method":
        if (action.item) {
          return { ...state, method: action.item };
        }
        return state;
      case "view":
        if (action.item) {
          return { ...state, view: action.item };
        }
        return state;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    from: { value: "all", label: "All" } as ComboboxItem,
    to: { value: "all", label: "All" } as ComboboxItem,
    method: { value: "all", label: "All" } as ComboboxItem,
    view: { value: "shipment", label: "Shipment" } as ComboboxItem,
  });

  const location = useLocation();

  const currentShipmentId = parseInt(
    location.pathname.split("/").at(-1) as string
  );
  const currentShipment = shipments?.find(
    (shipment) => shipment.id == currentShipmentId
  );

  useEffect(() => {
    if (actionData && actionData.data) {
      console.log(actionData)
      const doc = new jsPDF("landscape");

      const tableHeaders = [
        "Number",
        "Sender",
        "Receiver",
        "Description",
        "Notes",
        "Total Weight",
        "Paid",
      ];
      const tableData: (string | number)[][] = [];
      const visited: number[] = [];
      actionData.data.forEach((element) => {
        if (!element.references || visited.includes(element.references?.id))
          return;
        visited.push(element.references?.id ?? 0);
        const filteredData = actionData.data.filter(
          (row) => row.references?.id === element.references?.id
        );
        tableData.push([
          `${
            filteredData.reduce((a, b) => (a.number < b.number ? a : b)).number
          } - ${
            filteredData.reduce((a, b) => (a.number > b.number ? a : b)).number
          }`,
          `${filteredData[0].references?.customers?.name ?? "Unknown"} (${
            filteredData[0].references?.customers?.phone ?? "Unknown"
          })`,
          `${filteredData[0].references?.receivers?.name ?? "Unknown"} (${
            filteredData[0].references?.receivers?.phone ?? "Unknown"
          })`,
          filteredData[0].references?.description ?? "Unknown",
          filteredData[0].references?.notes ?? "Unknown",
          filteredData[0].references?.total_weight ?? "Unknown",
          filteredData[0].references?.paid
            ? ""
            : `Shipping: ${filteredData[0].references?.shipping} Clearance: ${filteredData[0].references?.clearance}` ??
              "Unknown",
          filteredData[0].references?.total_weight ?? "Unknown",
        ]);
      });

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        styles: { minCellHeight: 20 },
      });
      doc.save(`manifest_${actionData.data[0].references?.shipment}_.pdf`);
    }
  }, [actionData]);

  return (
    <>
      <Stack pt={20} mb={20} justify="space-between">
        <Title order={1} mb={10}>
          {" "}
          Shipments{" "}
        </Title>
        <Group justify="space-between">
          <ShipmentFilters state={state} dispatch={dispatch} />
          <ShipmentActions
            state={state}
            currentShipmentId={currentShipmentId}
            currentShipmentStatus={currentShipment?.status ?? -1}
            dispatch={dispatch}
          />
        </Group>
      </Stack>
      <Divider />
      <Flex h={"70vh"}>
        <Stack>
          {currentShipment && (
            <ShipmentCard shipment={currentShipment} isSelected={true} />
          )}
          <ScrollArea h={"70vh"} w={500}>
            {shipments &&
              shipments
                .filter(
                  (shipment) =>
                    (state.from.value == "all" ||
                      shipment.from == state.from.value) &&
                    (state.to.value == "all" ||
                      shipment.to == state.to.value) &&
                    (state.method.value == "all" ||
                      shipment.method == state.method.value) &&
                    shipment.id !== currentShipmentId
                )
                .map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    isSelected={false}
                  />
                ))}
          </ScrollArea>
        </Stack>
        <Divider orientation="vertical" mx={2} />
        <ScrollArea h={"70vh"} w={"100%"}>
          <Outlet
            context={{
              shipment: shipments?.find(
                (shipment) => shipment.id === parseInt(pathnames.at(-1)!)
              ),
              view: state.view,
            }}
          />
        </ScrollArea>
      </Flex>
    </>
  );
}
