import {
  Button,
  Checkbox,
  ComboboxItem,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { FormType } from "./NewReferenceForm";
import {
  CalculatePriceAir,
  CalculatePriceOcean,
} from "../QuoteCalculator/CalculatePrice";
import { useEffect } from "react";

export function PackageCard(props: {
  form: FormType;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
  states: {
    from: ComboboxItem | undefined;
    to: ComboboxItem | undefined;
    method: ComboboxItem | undefined;
    total_weight: number;
  };
  setStates: {
    setFrom: React.Dispatch<React.SetStateAction<ComboboxItem | undefined>>;
    setTo: React.Dispatch<React.SetStateAction<ComboboxItem | undefined>>;
    setMethod: React.Dispatch<React.SetStateAction<ComboboxItem | undefined>>;
    setTotalWeight: React.Dispatch<React.SetStateAction<number>>;
  };
}) {
  const { form, setValue, states, setStates } = props;
  const { from, to, method, total_weight } = states;
  const { setFrom, setTo, setMethod, setTotalWeight } = setStates;

  useEffect(() => {
    form.setFieldValue(
      "shipping",
      parseInt(
        method?.value === "air"
          ? CalculatePriceAir(
              from?.value ?? "",
              to?.value ?? "",
              total_weight
            )?.price.slice(1)
          : CalculatePriceOcean(
              from?.value ?? "",
              to?.value ?? "",
              form.values.small,
              form.values.large
            ).price.slice(1)
      )
    );

    form.setFieldValue(
      "clearance",
      parseInt(
        (method?.value === "air"
          ? CalculatePriceAir(from?.value ?? "", to?.value ?? "", total_weight)
              ?.clearance ?? "$0"
          : CalculatePriceOcean(
              from?.value ?? "",
              to?.value ?? "",
              form.values.small,
              form.values.large
            ).clearance ?? "$0"
        ).slice(1)
      )
    );
  }, [method, from, to, total_weight, form.values.small, form.values.large]);

  return (
    <Stack>
      <Stack px={50}>
        <Title order={4} mt={10}>
          Shipment Information
        </Title>
        <Group w={"100%"}>
          <Select
            w={{ xs: "100%", md: "30%" }}
            mt={5}
            label={"From"}
            defaultValue={"toronto"}
            data={[
              { value: "lagos", label: "Lagos" },
              { value: "toronto", label: "Toronto" },
            ]}
            value={from ? from.value : undefined}
            onChange={(_value, option) =>
              option.value === to?.value
                ? (setTo(from), setFrom(option))
                : setFrom(option)
            }
          ></Select>
          <Select
            w={{ xs: "100%", md: "30%" }}
            mt={5}
            label={"To"}
            defaultValue={"lagos"}
            data={[
              { value: "lagos", label: "Lagos" },
              { value: "toronto", label: "Toronto" },
            ]}
            value={to ? to.value : undefined}
            onChange={(_value, option) =>
              option.value === from?.value
                ? (setFrom(to), setTo(option))
                : setTo(option)
            }
          ></Select>
          <Select
            w={{ xs: "100%", md: "30%" }}
            mt={5}
            label={"Method"}
            defaultValue={"air"}
            data={[
              { value: "air", label: "Air" },
              { value: "ocean", label: "Ocean" },
            ]}
            value={method ? method.value : undefined}
            onChange={(_value, option) => setMethod(option)}
          ></Select>
        </Group>
        <Title order={4} mt={10}>
          Package Information
        </Title>
        <TextInput
          required
          label="Description"
          description="Description of box contents"
          placeholder="shoes, coffee, pencil"
          {...form.getInputProps("description")}
        />
        <TextInput
          label="Notes"
          description="Notes"
          placeholder="sender says package will be picked up 2 weeks late"
          {...form.getInputProps("notes")}
        />
        {method?.value === "air" ? (
          <Boxes
            form={form}
            total_weight={total_weight}
            from={from}
            to={to}
            setTotalWeight={setTotalWeight}
          />
        ) : (
          <Barrels form={form}></Barrels>
        )}
        <Title order={4} mt={10}>
          Payment Information
        </Title>
        <Group>
          <NumberInput
            label="Shipping"
            min={1}
            decimalScale={0}
            {...form.getInputProps("shipping")}
          ></NumberInput>
          <NumberInput
            label="Clearance"
            min={1}
            decimalScale={0}
            {...form.getInputProps("clearance")}
          ></NumberInput>
        </Group>

        <Checkbox
          mt="md"
          label="Paid"
          {...form.getInputProps("paid", { type: "checkbox" })}
        />
      </Stack>
      <Group w={"100%"} content="center" mt={30}>
        <Button
          type="button"
          w={150}
          bg={"gray"}
          onClick={() => setValue("Receiver Information")}
        >
          Back
        </Button>
        <Button type="submit" disabled={!form.values.description} w={150}>
          Submit
        </Button>
      </Group>
    </Stack>
  );
}

function boxesOnChange(
  form: FormType,
  index: number,
  total_weight: number,
  from: ComboboxItem | undefined,
  to: ComboboxItem | undefined,
  setTotalWeight: React.Dispatch<React.SetStateAction<number>>
) {
  const newWeight = Math.ceil(
    (form.getTransformedValues()["boxes"][index]["length"] *
      form.getTransformedValues()["boxes"][index]["width"] *
      form.getTransformedValues()["boxes"][index]["height"]) /
      366
  );

  setTotalWeight(
    total_weight - Number(form.values.boxes[index].weight) + newWeight
  );

  form.setFieldValue(`boxes.${index}.weight`, newWeight);
}

function Boxes(props: {
  form: FormType;
  total_weight: number;
  from: ComboboxItem | undefined;
  to: ComboboxItem | undefined;
  setTotalWeight: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { form, total_weight, from, to, setTotalWeight } = props;

  return (
    <>
      <NumberInput
        min={1}
        radius="md"
        label="Number of Boxes"
        stepHoldDelay={500}
        stepHoldInterval={100}
        clampBehavior="strict"
        onValueChange={(values) => {
          setTotalWeight((prev) =>
            values.floatValue
              ? prev - form.values.boxes.length + values.floatValue
              : prev
          );
          values.floatValue &&
            form.setValues((prev) => ({
              ...prev,
              ...prev.boxes?.splice(
                prev.boxes.length - (prev.boxes.length - values.floatValue!),
                prev.boxes.length - values.floatValue!,
                ...Array.from(
                  { length: values.floatValue! - prev.boxes.length },
                  () => ({ length: 1, width: 1, height: 1, weight: 1 })
                )
              ),
            }));
        }}
        {...form.getInputProps("number_of_boxes")}
      />
      {form.values.boxes.map((_, index) => (
        <Stack key={index}>
          <Text mt={"md"}>Box {index + 1}</Text>
          <Group>
            <Group>
              <NumberInput
                {...form.getInputProps(`boxes.${index}.length`)}
                label={`Length`}
                placeholder="1"
                min={1}
                decimalScale={0}
                onChange={(val) => {
                  form.setFieldValue(`boxes.${index}.length`, val);
                  if (
                    form.isTouched(`boxes.${index}.width`) &&
                    form.isTouched(`boxes.${index}.height`)
                  ) {
                    boxesOnChange(
                      form,
                      index,
                      total_weight,
                      from,
                      to,
                      setTotalWeight
                    );
                  }
                }}
              />
              <NumberInput
                {...form.getInputProps(`boxes.${index}.width`)}
                label={`Width`}
                placeholder="1"
                min={1}
                decimalScale={0}
                onChange={(val) => {
                  form.setFieldValue(`boxes.${index}.width`, val);
                  if (
                    form.isTouched(`boxes.${index}.length`) &&
                    form.isTouched(`boxes.${index}.height`)
                  ) {
                    boxesOnChange(
                      form,
                      index,
                      total_weight,
                      from,
                      to,
                      setTotalWeight
                    );
                  }
                }}
              />
              <NumberInput
                {...form.getInputProps(`boxes.${index}.height`)}
                label={`Height`}
                placeholder="1"
                min={1}
                decimalScale={0}
                onChange={(val) => {
                  form.setFieldValue(`boxes.${index}.height`, val);
                  if (
                    form.isTouched(`boxes.${index}.length`) &&
                    form.isTouched(`boxes.${index}.width`)
                  ) {
                    boxesOnChange(
                      form,
                      index,
                      total_weight,
                      from,
                      to,
                      setTotalWeight
                    );
                  }
                }}
              />
            </Group>
            <NumberInput
              {...form.getInputProps(`boxes.${index}.weight`)}
              label={`Weight`}
              placeholder="1"
              min={1}
              decimalScale={0}
              onChange={(val) => {
                setTotalWeight(
                  total_weight -
                    Number(form.values.boxes[index].weight) +
                    Number(val)
                );

                form.setFieldValue(`boxes.${index}.weight`, val);
              }}
            />
          </Group>
        </Stack>
      ))}
    </>
  );
}

function Barrels(props: { form: FormType }) {
  const { form } = props;

  return (
    <>
      <Group>
        <NumberInput
          {...form.getInputProps("small")}
          label="Small Barrels"
          min={0}
          decimalScale={0}
        ></NumberInput>
        <NumberInput
          {...form.getInputProps("large")}
          label="Large Barrels"
          min={0}
          decimalScale={0}
        ></NumberInput>
      </Group>
    </>
  );
}
