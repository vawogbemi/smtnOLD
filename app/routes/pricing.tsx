import { Accordion, Stack, Table, Title } from "@mantine/core";

const offices = [
  {
    from: "Lagos",
    to: "Toronto",
    currency: "₦",
    notes: "",
    rates: [
      {
        range: "1 - 9",
        rate: 6000,
        clearance: "$ 20",
      },
      {
        range: "10 - 99",
        rate: 5600,
        clearance: "$ 2/kg",
      },
      {
        range: "100+",
        rate: 5500,
        clearance: "$ 1.5/kg",
      },
    ],
  },
  {
    from: "Toronto",
    to: "Lagos",
    currency: "$",
    notes: "",
    rates: [
      {
        range: "1 - 5",
        rate: 20,
        clearance: "",
      },
      {
        range: "6 - 14",
        rate: 15,
        clearance: "",
      },
      {
        range: "15+",
        rate: 20,
        clearance: "",
      },
    ],
  },
];

const items = offices.map((item) => (
  <Accordion.Item
    key={`${item.from} to ${item.to}`}
    value={`${item.from} to ${item.to}`}
  >
    <Accordion.Control>{`${item.from} to ${item.to}`}</Accordion.Control>
    <Accordion.Panel>
      <PricingTable currency={item.currency} elements={item.rates} />
      {item.notes}
    </Accordion.Panel>
  </Accordion.Item>
));

function PricingTable(props: {
  currency: string,
  elements: {
    range: string;
    rate: number;
    clearance: string;
  }[];
}) {
  const { currency, elements } = props;
  const rows = elements.map((element) => (
    <Table.Tr key={element.range}>
      <Table.Td>{element.range}</Table.Td>
      <Table.Td>{`${currency} ${element.rate}`}</Table.Td>
      <Table.Td>{element.clearance}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Range</Table.Th>
          <Table.Th>Rate</Table.Th>
          <Table.Th>Clearance</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export default function Pricing() {
  return (
    <Stack maw={1000} mx={"auto"}>
      <Title order={1}>Pricing</Title>
      <Accordion>{items}</Accordion>
    </Stack>
  );
}
