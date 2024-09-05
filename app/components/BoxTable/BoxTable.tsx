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
import classes from "./BoxTable.module.css";
import { useNavigate } from "@remix-run/react";

interface RowData {
  reference: number;
  number: number;
  length: number;
  width: number;
  height: number;
  weight: number;
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

function Row(props: { row: RowData }) {
  const { row } = props;

  const navigate = useNavigate();

  return (
    <Table.Tr>
      {false && (
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
      )}

      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          {row.number}
        </UnstyledButton>
      </Table.Td>
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          {row.length}
        </UnstyledButton>
      </Table.Td>
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>{row.width}</UnstyledButton>
      </Table.Td>
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          {row.height}
        </UnstyledButton>
      </Table.Td>
      <Table.Td className={classes.th}>
        <UnstyledButton className={classes.control}>
          {row.weight}
        </UnstyledButton>
      </Table.Td>
    </Table.Tr>
  );
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => {
      switch (key) {
        default:
          return item[key].toString().includes(query);
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
          default:
            return Number(a[sortBy]) - Number(b[sortBy]);
        }
      }

      switch (sortBy) {
        default:
          return Number(b[sortBy]) - Number(a[sortBy]);
      }
    }),
    payload.search
  );
}

export function BoxTable(props: { data: RowData[] }) {
  const { data } = props;
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

  const rows = sortedData.map((row, index) => <Row key={index} row={row} />);

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
            {false && (
              <Th
                sorted={sortBy === "reference"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("reference")}
              >
                Reference
              </Th>
            )}
            <Th
              sorted={sortBy === "number"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("number")}
            >
              Number
            </Th>
            <Th
              sorted={sortBy === "length"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("length")}
            >
              Length
            </Th>
            <Th
              sorted={sortBy === "width"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("width")}
            >
              Width
            </Th>
            <Th
              sorted={sortBy === "height"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("height")}
            >
              Height
            </Th>
            <Th
              sorted={sortBy === "weight"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("weight")}
            >
              Weight
            </Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={6}>
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
