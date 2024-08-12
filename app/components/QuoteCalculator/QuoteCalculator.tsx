import {
  Anchor,
  Button,
  Center,
  ComboboxItem,
  Flex,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export function QuoteCalculator(props: {
  data:
    | {
        price: string;
        clearance: string | null;
      }
    | null
    | undefined;
}) {
  const { data } = props;

  const submit = useSubmit();

  const form = useForm({
    initialValues: {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      small: 0,
      large: 0,
    },
  });

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

  return (
    <Center h={"100%"}>
      <Stack
        bg={"gray.1"}
        w={"90%"}
        mt={50}
        h={{ xs: 1000, sm: 800, md: 600 }}
        py={25}
      >
        <Flex
          bg="white"
          style={{ borderRadius: 10, alignItems: "center" }}
          w={"90%"}
          h={50}
          mt={25}
          mx={"auto"}
        >
          <Text my={"auto"} ml={10}>
            Are you a business?{" "}
            <Anchor href="mailto:makepencils@gmail.com">
              Please contact us.
            </Anchor>
          </Text>
        </Flex>
        <form
          onSubmit={form.onSubmit((values) =>
            submit(
              {
                ...values,
                action: "quote",
                from: from?.value as string,
                to: to?.value as string,
                method: method?.value as string,
              },
              { method: "post" }
            )
          )}
        >
          <Stack px={50}>
            <Group w={"100%"}>
              <Select
                w={{ xs: "100%", md: "30%" }}
                mx={"auto"}
                mt={5}
                label={"From"}
                defaultValue={"toronto"}
                error={
                  from?.value === to?.value
                    ? "Cannot be the same as to"
                    : undefined
                }
                data={[
                  { value: "lagos", label: "Lagos" },
                  { value: "toronto", label: "Toronto" },
                ]}
                value={from ? from.value : undefined}
                onChange={(_value, option) => option.value === to?.value ? (setTo(from), setFrom(option)) : setFrom(option)}
              ></Select>
              <Select
                w={{ xs: "100%", md: "30%" }}
                mx={"auto"}
                mt={5}
                label={"To"}
                defaultValue={"lagos"}
                error={
                  to?.value === from?.value
                    ? "Cannot be the same as from"
                    : undefined
                }
                data={[
                  { value: "lagos", label: "Lagos" },
                  { value: "toronto", label: "Toronto" },
                ]}
                value={to ? to.value : undefined}
                onChange={(_value, option) => option.value === from?.value ? (setFrom(to), setTo(option)) : setTo(option)}
              ></Select>
              <Select
                w={{ xs: "100%", md: "30%" }}
                mx={"auto"}
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
            <Title order={5} mt={10}>
              {" "}
              Package Information{" "}
            </Title>
            {method?.value === "ocean" ? (
              <Group w={"100%"}>
                {" "}
                <NumberInput
                  mx={"auto"}
                  label="Small Barrels"
                  min={0}
                  {...form.getInputProps("small")}
                ></NumberInput>
                <NumberInput
                  mx={"auto"}
                  label="Large Barrels"
                  min={0}
                  {...form.getInputProps("large")}
                ></NumberInput>
              </Group>
            ) : (
              <Group w={"100%"}>
                <NumberInput
                  mx={"auto"}
                  label="Weight"
                  min={0}
                  {...form.getInputProps("weight")}
                ></NumberInput>
                <NumberInput
                  mx={"auto"}
                  label="Length"
                  min={0}
                  {...form.getInputProps("length")}
                ></NumberInput>
                <NumberInput
                  mx={"auto"}
                  label="Width"
                  min={0}
                  {...form.getInputProps("width")}
                ></NumberInput>
                <NumberInput
                  mx={"auto"}
                  label="Height"
                  min={0}
                  {...form.getInputProps("height")}
                ></NumberInput>
              </Group>
            )}
            <Button type="submit" mt={10}>
              Get Quote
            </Button>
            <Center>
              <Anchor fw={700} mt={-10} href="/pricing">
                {" "}
                Does not include pricing for special items
              </Anchor>
            </Center>
            {data && (
              <Group mt={10}>
                <Title order={5}>Shipping</Title>
                <Text>{data.price}</Text>
                <Title order={5}>Clearance</Title>
                <Text>{data.clearance}</Text>
              </Group>
            )}
          </Stack>
        </form>
      </Stack>
    </Center>
  );
}
