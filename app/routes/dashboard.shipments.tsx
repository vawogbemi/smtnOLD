import {
  Button,
  Card,
  ComboboxItem,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Outlet,
  useActionData,
  useLoaderData,
  useLocation,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { supabaseServiceRoleClient } from "~/api/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const supabase = supabaseServiceRoleClient();

  if (formData.get("action") === "status") {
    await supabase
      .from("shipments")
      .update({ status: parseInt(formData.get("status") as string) + 1 })
      .eq("id", formData.get("shipment") as string);

    /*if (parseInt(formData.get("status") as string) === 3) {
      break;
      //Send SMS
    }*/
    return undefined;
  }

  if (formData.get("action") === "manifest") {
    const data = await supabase
      .from("boxes")
      .select(
        "number, length, width, height, weight, references(id, shipment, paid, total_weight, shipping, clearance, description, notes, customers (name), receivers (name))"
      )
      .eq("references.shipment", parseInt(formData.get("shipment") as string));

    return data;
  }

  return undefined;
};

export const loader = async () => {
  const supabase = supabaseServiceRoleClient();

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

function statusToString(status: number) {
  switch (status) {
    case 0:
      return "Created";
    case 1:
      return "Confirmed";
    case 2:
      return "In Transit";
    case 3:
      return "Arrived";
    case 4:
      return "Notified";
    default:
      return "Unknown";
  }
}

export default function Shipments() {
  const { shipments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const pathnames = useLocation().pathname.split("/");

  const [from, setFrom] = useState<ComboboxItem>({
    value: "all",
    label: "All",
  });
  const [to, setTo] = useState<ComboboxItem>({
    value: "all",
    label: "All",
  });
  const [method, setMethod] = useState<ComboboxItem>({
    value: "all",
    label: "All",
  });

  const submit = useSubmit();
  const location = useLocation();
  const currentShipmentId = parseInt(
    location.pathname.split("/").at(-1) as string
  );
  const currentShipment = shipments?.find(
    (shipment) => shipment.id == currentShipmentId
  );
  const [references, setReferences] = useState<
    { sender: string; receiver: string; paid: string; numbers: string }[]
  >([]);

  useEffect(() => {
    if (actionData && actionData.data) {
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
        if (visited.includes(element.references?.id ?? 0)) return;
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
          filteredData[0].references?.customers?.name ?? "Unknown",
          filteredData[0].references?.receivers?.name ?? "Unknown",
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
      doc.save(`manifest_${currentShipmentId}_.pdf`);
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
          <Group mt={-22.5}>
            <Select
              label="From"
              w={175}
              data={[
                { value: "all", label: "All" },
                { value: "lagos", label: "Lagos" },
                { value: "toronto", label: "Toronto" },
              ]}
              value={from ? from.value : undefined}
              onChange={(_value, option) =>
                option.value === to?.value && to?.value !== "all"
                  ? (setTo(from), setFrom(option))
                  : setFrom(option)
              }
            ></Select>
            <Select
              label="To"
              w={175}
              data={[
                { value: "all", label: "All" },
                { value: "lagos", label: "Lagos" },
                { value: "toronto", label: "Toronto" },
              ]}
              value={to ? to.value : undefined}
              onChange={(_value, option) =>
                option.value === from?.value && from?.value !== "all"
                  ? (setFrom(to), setTo(option))
                  : setTo(option)
              }
            ></Select>
            <Select
              label="Method"
              w={175}
              data={[
                { value: "all", label: "All" },
                { value: "air", label: "Air" },
                { value: "ocean", label: "Ocean" },
              ]}
              value={method ? method.value : undefined}
              onChange={(_value, option) => setMethod(option)}
            ></Select>
          </Group>
          <Group>
            <Button>Toggle Delivery</Button>
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
            <Button disabled={!currentShipmentId}>Send Sms</Button>
            <Tooltip label="Next Status">
              <Button
                disabled={!currentShipmentId}
                onClick={() =>
                  submit(
                    {
                      action: "status",
                      shipment: currentShipmentId,
                      status: currentShipment?.status ?? -2,
                    },
                    { method: "post" }
                  )
                }
              >
                Next Status:{" "}
                {statusToString((currentShipment?.status ?? -2) + 1)}
              </Button>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
      <Divider />
      <Flex h={"70vh"}>
        <ScrollArea h={"70vh"} w={"35%"}>
          {shipments &&
            shipments
              .filter(
                (shipment) =>
                  (from.value == "all" || shipment.from == from.value) &&
                  (to.value == "all" || shipment.to == to.value) &&
                  (method.value == "all" || shipment.method == method.value)
              )
              .map((shipment) => (
                <Card
                  key={shipment.id}
                  component="a"
                  href={`/dashboard/shipments/${shipment.id}`}
                  withBorder
                  style={{
                    borderRadius: "0px",
                    borderLeft: "0px",
                    borderRight: "0px",
                    borderTop: "0px",
                    backgroundColor:
                      pathnames.length > 0 &&
                      parseInt(pathnames.at(-1)!) === shipment.id
                        ? "#dee2e6"
                        : "white",
                  }}
                  styles={{
                    root: {
                      ":hover": {
                        bg: "#dee2e6",
                      },
                    },
                  }}
                  px={30}
                  h={75}
                >
                  <Stack>
                    <Group>
                      <Text c={"gray"} size="sm">
                        {upperFirst(shipment.from)}
                      </Text>
                      <Text c={"gray"} size="sm">
                        {upperFirst(shipment.to)}
                      </Text>
                      <Text c={"gray"} size="sm">
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
                      <Text>Packages: {shipment.packages}</Text>
                      <Text>Status: {statusToString(shipment.status)}</Text>
                    </Group>
                  </Stack>
                </Card>
              ))}
        </ScrollArea>
        <Divider orientation="vertical" mx={2} />
        <ScrollArea h={"70vh"} w={"65%"}>
          <Outlet
            context={{
              shipment: shipments?.find(
                (shipment) => shipment.id === parseInt(pathnames.at(-1)!)
              ),
              references,
              setReferences,
            }}
          />
        </ScrollArea>
      </Flex>
    </>
  );
}
