import {
  Button,
  Card,
  ComboboxItem,
  Divider,
  Flex,
  Group,
  Input,
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
import { supabase } from "~/api/supabase";

export const loader = async () => {

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select()
    .order("id", { ascending: true });

  if (customersError) {
    console.log(`customers | customersError: ${customersError.message}`);
  }

  return json({ customers });
};

export default function Shipments() {
  const { customers } = useLoaderData<typeof loader>();
  const pathnames = useLocation().pathname.split("/");

  const [search, setSearch] = useState("");

  const location = useLocation();
  const currentCustomerId = parseInt(
    location.pathname.split("/").at(-1) as string
  );
  const currentCustomer = customers?.find(
    (customer) => customer.id == currentCustomerId
  );

  const [view, setView] = useState<ComboboxItem>({
    label: "References",
    value: "references",
  });

  return (
    <>
      <Stack pt={20} mb={20} justify="space-between">
        <Group justify="space-between">
          <Title order={1} mb={10}>
            {" "}
            Customers{" "}
          </Title>
          <Group></Group>
        </Group>
        <Group justify="space-between">
          <Group>
            <Input
              placeholder="Search"
              w={400}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Group>

          <Group>
            <Select
              disabled={!currentCustomerId}
              data={[
                { value: "references", label: "References" },
                { value: "receivers", label: "Receivers" },
                { value: "deliveries", label: "Deliveries" },
              ]}
              value={view ? view.value : undefined}
              onChange={(_, option) =>
                option.value == view.value ? null : setView(option)
              }
              label="View"
            />
            <Group mb={-22.5}>
              <Button disabled={!currentCustomerId}>Send Sms</Button>
            </Group>
          </Group>
        </Group>
      </Stack>
      <Divider />
      <Flex h={"70vh"}>
        <Stack>
          {currentCustomer && (
            <Tooltip
            multiline
            w={200}
            label={`${currentCustomer.name} • ${
              currentCustomer.phone
            }`}
          >
            <Card
              component="a"
              href={`/dashboard/customers/${currentCustomer.id}`}
              withBorder
              style={{
                borderRadius: "1px",
                borderLeft: "0px",
                borderRight: "0px",
                borderTop: "0px",
                backgroundColor: "#dee2e6",
              }}
              px={30}
              h={75}
            >
              <Stack>
                <Text c={"gray"} size="sm">
                  {`${upperFirst(currentCustomer?.phone)}`}
                </Text>
                <Text mt={-20}>{upperFirst(currentCustomer?.name)}</Text>
              </Stack>
            </Card>
            </Tooltip>
          )}
          <ScrollArea h={"70vh"} w={500}>
            {customers &&
              customers
                .filter(
                  (customer) =>
                    (customer.name
                      .toLowerCase()
                      .startsWith(search.toLowerCase()) ||
                      customer.name
                        .toLowerCase()
                        .includes(search.toLowerCase())) &&
                    customer.id !== currentCustomerId
                )
                .map((customer) => (
                  <Card
                    key={customer.id}
                    component="a"
                    href={`/dashboard/customers/${customer.id}`}
                    withBorder
                    style={{
                      borderRadius: "0px",
                      borderLeft: "0px",
                      borderRight: "0px",
                      borderTop: "0px",
                      backgroundColor: "white",
                    }}
                    px={30}
                    h={75}
                  >
                    <Tooltip
                      multiline
                      w={200}
                      label={`${customer.name} • ${
                        customer.phone
                      }`}
                    >
                      <Stack>
                        <Group>
                          <Text c={"gray"} size="sm">
                            {upperFirst(customer.phone)}
                          </Text>
                        </Group>
                        <Group mt={-20}>
                          <Text>{upperFirst(customer.name)}</Text>
                        </Group>
                      </Stack>
                    </Tooltip>
                  </Card>
                ))}
          </ScrollArea>
        </Stack>
        <Divider orientation="vertical" mx={2} />
        <ScrollArea h={"70vh"} w={"100%"}>
          <Outlet
            context={{
              customer: customers?.find(
                (customer) => customer.id === parseInt(pathnames.at(-1)!)
              ),
            }}
          />
        </ScrollArea>
      </Flex>
    </>
  );
}
