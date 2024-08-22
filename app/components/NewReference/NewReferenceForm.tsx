import { Accordion, ComboboxItem, Group, Title } from "@mantine/core";
import { CustomerCard } from "./CustomerCard";
import { useForm, UseFormReturnType } from "@mantine/form";
import { ReceiverCard } from "./ReceiverCard";
import { useState } from "react";
import { PackageCard } from "./PackageCard";
import { useSubmit } from "@remix-run/react";

export type FormType = UseFormReturnType<
  {
    phone: string;
    receiver_phone: string;
    receiver_name: string;
    description: string;
    notes: string;
    number_of_boxes: number;
    boxes: {
      length: number;
      width: number;
      height: number;
      weight: number;
    }[];
    small: number;
    large: number;
    shipping: number;
    clearance: number;
    paid: boolean;
  },
  (values: {
    phone: string;
    receiver_phone: string;
    receiver_name: string;
    description: string;
    notes: string;
    number_of_boxes: number;
    boxes: {
      length: number;
      width: number;
      height: number;
      weight: number;
    }[];
    small: number;
    large: number;
    shipping: number;
    clearance: number;
    paid: boolean;
  }) => {
    phone: string;
    receiver_phone: string;
    receiver_name: string;
    description: string;
    notes: string;
    number_of_boxes: number;
    boxes: {
      length: number;
      width: number;
      height: number;
      weight: number;
    }[];
    small: number;
    large: number;
    shipping: number;
    clearance: number;
    paid: boolean;
  }
>;

export function NewReferenceForm(props: {
  data:
    | {
        address: string;
        created_at: string;
        email: string | null;
        id: number;
        name: string | null;
        phone: string;
      }
    | null
    | undefined;
  toggleCreateReference: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data, toggleCreateReference } = props;

  const form = useForm({
    initialValues: {
      phone: "",
      receiver_phone: "",
      receiver_name: "",
      description: "",
      notes: "",
      number_of_boxes: 1,
      boxes: [{ length: 1, width: 1, height: 1, weight: 1 }],
      large: 0,
      small: 0,
      shipping: 0,
      clearance: 0,
      paid: false,
    },
  });

  const [value, setValue] = useState<string | null>("Customer Information");
  const submit = useSubmit();

  const [from, setFrom] = useState<ComboboxItem | undefined>({
    value: "toronto",
    label: "Toronto",
  });

  const [to, setTo] = useState<ComboboxItem | undefined>({
    value: "lagos",
    label: "Lagos",
  });

  const [method, setMethod] = useState<ComboboxItem | undefined>({
    value: "air",
    label: "Air",
  });

  const [total_weight, setTotalWeight] = useState(1);

  return (
    <>
      <Group mb={20} justify="space-between">
        <Title order={1}> Create Reference </Title>
      </Group>
      <form
        onSubmit={form.onSubmit(
          (values) => (
            Object.assign(
              values,
              ...[
                ...values.boxes.flatMap((x, index) => [
                  {
                    [`length_${index + 1}`]: x.length,
                    [`width_${index + 1}`]: x.width,
                    [`height_${index + 1}`]: x.height,
                    [`weight_${index + 1}`]: x.weight,
                  },
                ]),
              ]
            ),
            submit(
              {
                ...values,
                action: "submit",
                from: from?.value as string,
                to: to?.value as string,
                method: method?.value as string,
                total_weight: total_weight,
              },
              { method: "post" }
            ),
            toggleCreateReference(false)
          )
        )}
      >
        <Accordion
          variant="contained"
          radius="md"
          value={value}
          onChange={
            () => null
            //v ? (setValue(v), setLastClicked(v)) : setValue(lastClicked) -> allows accordian to be clicked but not collapsed
          }
        >
          <Accordion.Item value={"Customer Information"}>
            <Accordion.Control>
              <Title order={3}>Customer Information</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <CustomerCard form={form} setValue={setValue} data={data} />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Receiver Information">
            <Accordion.Control>
              <Title order={3}>Receiver Information</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <ReceiverCard form={form} setValue={setValue} />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Package Information">
            <Accordion.Control>
              <Title order={3}>Package Information</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <PackageCard
                form={form}
                setValue={setValue}
                states={{ from, to, method, total_weight }}
                setStates={{ setFrom, setTo, setMethod, setTotalWeight }}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </form>
    </>
  );
}
