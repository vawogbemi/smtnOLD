import { Anchor, ScrollArea, Table, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export function ReferenceTable(props: {
  references: {
    created_at: string
    customer_3: number | null
    customer_4: number | null
    customer_5: number | null
    delivery: number | null
    description: string
    id: number
    large: number
    notes: string
    packages: number
    paid: boolean
    received: boolean
    receiver: number
    sender: number
    shipment: number
    small: number
    total_weight: number
  }[];
}) {
  const { references } = props;

  const rows = references.map((row, index) => (
    <Table.Tr key={row.id}>
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>
        <Anchor href={`/dashboard/references/${row.id}`}> {row.id} </Anchor>
      </Table.Td>
      <Table.Td>
        <Anchor href={`/dashboard/customers/${row.sender}`}>
          {" "}
          {row.sender}{" "}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Anchor href={`/dashboard/customers/${row.receiver}`}>
          {" "}
          {row.receiver}{" "}
        </Anchor>
      </Table.Td>
      <Table.Td>
        {row.paid ? (
          <IconCheck size={10} color="green" />
        ) : (
          <IconX size={10} color="red" />
        )}
      </Table.Td>
      <Table.Td>
        {row.received ? (
          <IconCheck size={10} color="green" />
        ) : (
          <IconX size={10} color="red" />
        )}
      </Table.Td>
      <Table.Td>
        {row.delivery ? (
          <IconCheck size={10} color="green" />
        ) : (
          <IconX size={10} color="red" />
        )}
      </Table.Td>
      <Table.Td>{row.total_weight}</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={300}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Number</Table.Th>
            <Table.Th>Reference</Table.Th>
            <Table.Th>Sender</Table.Th>
            <Table.Th>Receiver</Table.Th>
            <Table.Th>Paid</Table.Th>
            <Table.Th>Received</Table.Th>
            <Table.Th>Delivery</Table.Th>
            <Table.Th>Total Weight</Table.Th>
          </Table.Tr>
        </Table.Thead>
        {rows.length > 0 ? (
          <Table.Tbody>{rows}</Table.Tbody>
        ) : (
          <Table.Tbody>
            <Table.Td colSpan={8}>
              <Text fw={500} ta="center">
                Nothing found
              </Text>
            </Table.Td>
          </Table.Tbody>
        )}
      </Table>
    </ScrollArea>
  );
}
