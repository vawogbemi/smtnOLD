import { useState } from "react";
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  keys,
  Tooltip,
} from "@mantine/core";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";
import classes from "./DeliveryTable.module.css";
import { useNavigate, useSubmit } from "@remix-run/react";

interface RowData {
  reference: number;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
  description: string;
  notes: string;
  paid: boolean;
  received: boolean;
  packages: number;
  total_weight: number;
  small: number;
  large: number;
  shipping: number;
  clearance: number;
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function Row(props: { row: RowData; method: string }) {
  const { row, method } = props;

  const navigate = useNavigate();
  const submit = useSubmit();

  const [paid, setPaid] = useState(row.paid);
  const [received, setReceived] = useState(row.received);

  return (
    <Table.Tr>
      <Table.Td className={classes.th}>
        <Tooltip label={"Click here to view reference"}>
          <UnstyledButton
            className={classes.control}
            onClick={() => navigate(`/dashboard/references/${row.reference}`)}
          >
            {row.reference}
          </UnstyledButton>
        </Tooltip>
      </Table.Td>

      <Table.Td className={classes.th}>
        <Tooltip label={row.sender.name}>
          <UnstyledButton
            className={classes.control}
            onClick={() => navigate(`/dashboard/customers/${row.sender.id}`)}
          >
            <Text truncate="end">{row.sender.name}</Text>
          </UnstyledButton>
        </Tooltip>
      </Table.Td>

      <Table.Td className={classes.th}>
        <Tooltip label={row.receiver.name}>
          <UnstyledButton
            className={classes.control}
            //onClick={() => navigate(`/dashboard/customers/${row.receiver.id}`)}
          >
            <Text truncate="end">{row.receiver.name}</Text>
          </UnstyledButton>
        </Tooltip>
      </Table.Td>
      <Table.Td className={classes.th}>
        <Tooltip label={row.description}>
          <UnstyledButton className={classes.control}>
            <Text truncate="end">{row.description}</Text>
          </UnstyledButton>
        </Tooltip>
      </Table.Td>
      <Table.Td className={classes.th}>
        <Tooltip label={row.notes}>
          <UnstyledButton className={classes.control}>
            <Text truncate="end">{row.notes}</Text>
          </UnstyledButton>
        </Tooltip>
      </Table.Td>
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          {row.packages}
        </UnstyledButton>
      </Table.Td>

      {(method === "air" || method == "all") && (
        <Table.Td className={classes.th}>
          <UnstyledButton className={classes.control}>
            {row.total_weight}
          </UnstyledButton>
        </Table.Td>
      )}
      {(method === "ocean" || method == "all") && (
        <>
          <Table.Td className={classes.th}>
            <UnstyledButton className={classes.control}>
              {row.small}
            </UnstyledButton>{" "}
          </Table.Td>

          <Table.Td className={classes.th}>
            <UnstyledButton className={classes.control}>
              {row.large}
            </UnstyledButton>
          </Table.Td>
        </>
      )}
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          <Text truncate="end">{row.shipping}</Text>
        </UnstyledButton>
      </Table.Td>
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          <Text truncate="end">{row.clearance}</Text>
        </UnstyledButton>
      </Table.Td>

      <Table.Td className={classes.th}>
        <Tooltip label={paid ? "Click to mark as unpaid" : "Click to mark as paid"}>
        <UnstyledButton
          className={classes.control}
          bg={paid ? "green" : "red"}
          w={"90%"}
          onClick={() => (
            submit(
              {
                action: "paid",
                paid: Number(row.paid),
                id: row.reference,
              },
              { method: "post" }
            ),
            setPaid(!paid)
          )}
        ></UnstyledButton>
        </Tooltip>
      </Table.Td>

      <Table.Td className={classes.th}>
        <Tooltip label={received ? "Click to mark as unreceived" : "Click to mark as received"}>
        <UnstyledButton
          className={classes.control}
          bg={received ? "green" : "red"}
          w={"90%"}
          onClick={() => (
            submit(
              {
                action: "received",
                paid: Number(row.received),
                id: row.reference,
              },
              { method: "post" }
            ),
            setReceived(!received)
          )}
        ></UnstyledButton>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => {
      switch (key) {
        case "paid":
          return false;
        case "received":
          return false;
        case "sender":
          return item[key].name.toLowerCase().includes(query);
        case "receiver":
          return item[key].name.toLowerCase().includes(query);
        default:
          item[key].toString().toLowerCase().includes(query);
      }
    })
  );
}

function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        switch (sortBy) {
          case "paid":
            return Number(a[sortBy]) - Number(b[sortBy]);
          case "received":
            return Number(a[sortBy]) - Number(b[sortBy]);
          case "sender":
            return b[sortBy].name.localeCompare(a[sortBy].name);
          case "receiver":
            return b[sortBy].name.localeCompare(a[sortBy].name);
          default:
            return b[sortBy].toString().localeCompare(a[sortBy].toString());
        }
      }

      switch (sortBy) {
        case "paid":
          return Number(b[sortBy]) - Number(a[sortBy]);
        case "received":
          return Number(b[sortBy]) - Number(a[sortBy]);
        case "sender":
          return a[sortBy].name.localeCompare(b[sortBy].name);
        case "receiver":
          return a[sortBy].name.localeCompare(b[sortBy].name);
        default:
          return a[sortBy].toString().localeCompare(b[sortBy].toString());
      }
    }),
    payload.search
  );
}

export function ShipmentTable(props: { data: RowData[]; method: string }) {
  const { data, method } = props;
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  const rows = sortedData.map((row, index) => (
    <Row key={index} row={row} method={method} />
  ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        leftSection={
          <IconSearch
            style={{ width: rem(16), height: rem(16) }}
            stroke={1.5}
          />
        }
        value={search}
        onChange={handleSearchChange}
      />
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        miw={700}
        layout="fixed"
      >
        <Table.Tbody>
          <Table.Tr>
            <Th
              sorted={sortBy === "reference"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("reference")}
            >
              Reference
            </Th>
            <Th
              sorted={sortBy === "sender"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("sender")}
            >
              Sender
            </Th>
            <Th
              sorted={sortBy === "receiver"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("receiver")}
            >
              Receiver
            </Th>
            <Th
              sorted={sortBy === "description"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("description")}
            >
              Description
            </Th>
            <Th
              sorted={sortBy === "notes"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("notes")}
            >
              Notes
            </Th>
            <Th
              sorted={sortBy === "packages"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("packages")}
            >
              Packages
            </Th>
            {(method === "air" || method == "all") && (
              <Th
                sorted={sortBy === "total_weight"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("total_weight")}
              >
                Total Weight
              </Th>
            )}
            {(method === "ocean" || method == "all") && (
              <>
                <Th
                  sorted={sortBy === "small"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("small")}
                >
                  Small
                </Th>
                <Th
                  sorted={sortBy === "large"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("large")}
                >
                  Large
                </Th>
              </>
            )}
            <Th
              sorted={sortBy === "shipping"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("shipping")}
            >
              Shipping
            </Th>
            <Th
              sorted={sortBy === "clearance"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("clearance")}
            >
              Clearance
            </Th>
            <Th
              sorted={sortBy === "paid"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("paid")}
            >
              Paid
            </Th>
            <Th
              sorted={sortBy === "received"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("received")}
            >
              Received
            </Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={method === "all" ? 13 : method == "air" ? 11 : 12}
              >
                <Text fw={500} ta="center">
                  Nothing found
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
