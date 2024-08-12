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
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { useState } from "react";
import { supabaseServiceRoleClient } from "~/api/server";

export const loader = async () => {
  const supabase = supabaseServiceRoleClient();

  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select("*")
    .order("id", { ascending: true });

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
    default:
      return "Unknown";
  }
}

export default function Shipments() {
  const { shipments } = useLoaderData<typeof loader>();
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
            <Button>Print Manifest</Button>
            <Button>Send Sms</Button>
            <Tooltip label="Next Statu">
              <Button>Next Status</Button>
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
            }}
          />
        </ScrollArea>
      </Flex>
    </>
  );
}
