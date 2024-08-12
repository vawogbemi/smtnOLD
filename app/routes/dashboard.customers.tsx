import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Input,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { useState } from "react";
import { supabaseServiceRoleClient } from "~/api/server";

export const loader = async () => {
  const supabase = supabaseServiceRoleClient();

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

  return (
    <>
      <Stack pt={20} mb={20} justify="space-between">
        <Title order={1} mb={10}>
          {" "}
          Customers{" "}
        </Title>
        <Group justify="space-between">
          <Group>
            <Input
              placeholder="Search"
              w={500}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Group>
          <Group>
            <Button>Send Sms</Button>
          </Group>
        </Group>
      </Stack>
      <Divider />
      <Flex h={"70vh"}>
        <ScrollArea h={"70vh"} w={"35%"}>
          {customers &&
            customers
              .filter(
                (customer) =>
                  customer.name
                    .toLowerCase()
                    .startsWith(search.toLowerCase()) ||
                  customer.name.toLowerCase().includes(search.toLowerCase())
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
                    backgroundColor:
                      pathnames.length > 0 &&
                      parseInt(pathnames.at(-1)!) === customer.id
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
                        {upperFirst(customer.phone)}
                      </Text>
                      <Text c={"gray"} size="sm">
                        {upperFirst(customer.email.toLowerCase())}
                      </Text>
                      <Text c={"gray"} size="sm">
                        {upperFirst(customer.address)}
                      </Text>
                    </Group>
                    <Group mt={-20}>
                      <Text>{upperFirst(customer.name)}</Text>
                    </Group>
                  </Stack>
                </Card>
              ))}
        </ScrollArea>
        <Divider orientation="vertical" mx={2} />
        <ScrollArea h={"70vh"} w={"65%"}>
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
