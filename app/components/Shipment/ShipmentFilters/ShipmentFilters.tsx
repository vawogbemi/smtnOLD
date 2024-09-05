import { Group, Select, ComboboxItem } from "@mantine/core";
import { upperFirst } from "@mantine/hooks";

interface FiltersState {
  from: ComboboxItem;
  to: ComboboxItem;
  method: ComboboxItem;
  view: ComboboxItem;
}

interface ShipmentFiltersProps {
  state: FiltersState;
  dispatch: React.Dispatch<{
    type: string;
    item?: ComboboxItem;
  }>;
}

export function ShipmentFilters({ state, dispatch }: ShipmentFiltersProps) {
  const locationOptions = [
    { value: "all", label: "All" },
    { value: "lagos", label: "Lagos" },
    { value: "toronto", label: "Toronto" },
  ];

  const methodOptions = [
    { value: "all", label: "All" },
    { value: "air", label: "Air" },
    { value: "ocean", label: "Ocean" },
  ];

  return (
    <Group mt={-22.5}>
      <Select
        label="From"
        w={175}
        data={locationOptions}
        value={state.from.value}
        onChange={(value) =>
          value &&
          dispatch({
            type: "from",
            item: { value: value, label: upperFirst(value) },
          })
        }
      />
      <Select
        label="To"
        w={175}
        data={locationOptions}
        value={state.to.value}
        onChange={(value) =>
          value &&
          dispatch({
            type: "to",
            item: { value: value, label: upperFirst(value) },
          })
        }
      />
      <Select
        label="Method"
        w={175}
        data={methodOptions}
        value={state.method.value}
        onChange={(value) =>
          value &&
          dispatch({
            type: "method",
            item: { value: value, label: upperFirst(value) },
          })
        }
      />
    </Group>
  );
}
