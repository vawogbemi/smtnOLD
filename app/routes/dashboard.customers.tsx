import {
  Anchor,
  Card,
  Input,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
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
    console.log(
      `dashboard/references | referencesError: ${customersError.message}`
    );
  }

  return json({ customers });
};

function CustomersTable(props: {
  customers: {
    created_at: string;
    email: string | null;
    id: number;
    name: string | null;
    phone: string;
  }[];
}) {
  const { customers } = props;

  const rows = customers.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td align="left">
        <Anchor href={`/dashboard/customers/${row.id}`}> {row.id} </Anchor>
      </Table.Td>
      <Table.Td align="left">{row.name}</Table.Td>
      <Table.Td align="left">{row.phone}</Table.Td>
      <Table.Td align="left">{row.email}</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={300}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Id</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Email</Table.Th>
          </Table.Tr>
        </Table.Thead>
        {rows.length > 0 ? (
          <Table.Tbody>{rows}</Table.Tbody>
        ) : (
          <Table.Td colSpan={4}>
            <Text fw={500} ta="center">
              Nothing found
            </Text>
          </Table.Td>
        )}
      </Table>
    </ScrollArea>
  );
}

export default function Customers() {
  const { customers } = useLoaderData<typeof loader>();

  const location = useLocation();

  const [filter, setFilter] = useState("");

  return (
    <Card withBorder radius="md" maw={1500} mx={"auto"}>
      <Title order={1} mb={10}>
        Customers
      </Title>
      {location.pathname == "/dashboard/customers/" ||
      location.pathname == "/dashboard/customers" ? (
        <>
          <Input
            ml={"auto"}
            w={400}
            placeholder="Filter"
            onChange={(e) => setFilter(e.target.value)}
          />
          <CustomersTable
            customers={
              customers?.filter(
                (customer) =>
                  customer.id.toString().includes(filter) ||
                  (customer.name && customer.name.includes(filter)) ||
                  (customer.email &&
                    customer.email.toString().includes(filter)) ||
                  customer.phone.toString().includes(filter)
              ) ?? []
            }
          />
        </>
      ) : (
        <Outlet context={{customers}} />
      )}
    </Card>
  );
}
