/* eslint-disable import/no-unresolved */
import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, useActionData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { InputWithButton } from "./tracking";
import wave from "/wave.svg";
import pic1 from "/pic1.jpg";
import Contact from "./contact";
import { IconArrowRight } from "@tabler/icons-react";
import { QuoteCalculator } from "~/components/QuoteCalculator/QuoteCalculator";
import {
  CalculatePriceAir,
  CalculatePriceOcean,
} from "~/components/QuoteCalculator/CalculatePrice";

export const meta: MetaFunction = () => {
  return [
    { title: "Smtn International" },
    {
      name: "Smtn International",
      content: "Logistics services that connect the world together",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  if (formData.get("action") === "tracking") {
    return redirect(`tracking/${formData.get("reference") as string}`);
  }

  if (formData.get("action") == "quote") {
    const from = formData.get("from") as string;
    const to = formData.get("to") as string;
    const method = formData.get("method") as string;

    if (method == "air") {
      const measured_weight = parseInt(formData.get("weight") as string);
      const length = parseInt(formData.get("length") as string);
      const width = parseInt(formData.get("width") as string);
      const height = parseInt(formData.get("height") as string);

      const volume = (length * width * height) / 366;

      const weight = Math.max(measured_weight, volume);

      console.log(CalculatePriceAir(from, to, weight));

      return json(CalculatePriceAir(from, to, weight));
    }

    if (method == "ocean") {
      const small = parseInt(formData.get("small") as string);
      const large = parseInt(formData.get("large") as string);
      console.log(from, to, small, large);
      console.log(CalculatePriceOcean(from, to, small, large));

      return json(CalculatePriceOcean(from, to, small, large));
    }
  }

  return null;
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<string | null>("first");

  const actionData = useActionData<typeof action>();

  const form1 = useForm({
    initialValues: {
      reference: "",
    },
  });

  const submit = useSubmit();

  return (
    <Stack>
      <Tabs defaultValue="first" value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab
            value="first"
            c={activeTab == "first" ? "white" : "gray.8"}
            bg={activeTab == "first" ? "blue.5" : "gray.0"}
            color="blue.5"
          >
            <Title order={1}>Track</Title>
          </Tabs.Tab>
          <Tabs.Tab
            value="second"
            c={activeTab == "second" ? "white" : "gray.8"}
            bg={activeTab == "second" ? "blue.5" : "gray.0"}
            color="blue.5"
          >
            <Title order={1}>Quote</Title>
          </Tabs.Tab>
        </Tabs.List>
        <Stack
          bg={"blue.5"}
          w={"100%"}
          h={{ xs: 1000, sm: 800, md: 600 }}
          py={25}
        >
          <Tabs.Panel value="first">
            <form
              onSubmit={form1.onSubmit((values) =>
                submit({ ...values, action: "tracking" }, { method: "post" })
              )}
            >
              <InputWithButton
                w={{ sm: 700, md: 900 }}
                mx={"auto"}
                {...form1.getInputProps("reference")}
              />
            </form>
          </Tabs.Panel>
          <Tabs.Panel value="second">
            <QuoteCalculator data={actionData} />
          </Tabs.Panel>
        </Stack>
      </Tabs>
      <Image src={wave} style={{ marginTop: -20 }} />
      <Flex wrap={"wrap"} px={{ md: 100 }}>
        <Stack>
          <Title order={1} mt={25} c={"gray.8"}>
            Your Premier Shipping Partner
          </Title>
          <Divider h={5} w={75} bg={"blue.5"} />
          <Title mt={10} order={4} w={400} c={"gray.6"}>
            SMTN specializes in international shipping services, with a primary
            focus on routes connecting Nigeria, Canada, and the United Kingdom.{" "}
          </Title>
        </Stack>
        <Image
          src={pic1}
          w={{ xs: 500, md: "45%" }}
          mt={20}
          ml={{ md: "auto" }}
          style={{ borderRadius: 20 }}
        />
      </Flex>
      <Flex
        w={"100%"}
        bg={"blue"}
        c={"white"}
        wrap={"wrap"}
        h={300}
        my={50}
        p={100}
      >
        <Stack mb={20}>
          <Title>Got any feedback?</Title>
          <Text>{"We're eager to listen!"}</Text>
        </Stack>
        <Group ml={{ md: "auto" }} mt={{ xs: 20, md: 0 }}>
          <Button
            bg={"black"}
            style={{ borderRadius: 20 }}
            component="a"
            href="mailto:makepencils@gmail.com"
          >
            <IconArrowRight />
          </Button>
        </Group>
      </Flex>
      <Flex wrap={"wrap"} mb={75}>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={400}
          mx={"auto"}
          mt={50}
        >
          <Card.Section>
            <Image
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
              height={160}
              alt="Norway"
            />
          </Card.Section>

          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Norway Fjord Adventures</Text>
          </Group>

          <Text size="sm" c="dimmed">
            With Fjord Tours you can explore more of the magical fjord
            landscapes with tours and activities on and around the fjords of
            Norway
          </Text>

          <Button color="blue" fullWidth mt="md" radius="md">
            Book classic tour now
          </Button>
        </Card>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={400}
          mx={"auto"}
          mt={50}
        >
          <Card.Section>
            <Image
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
              height={160}
              alt="Norway"
            />
          </Card.Section>

          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Norway Fjord Adventures</Text>
          </Group>

          <Text size="sm" c="dimmed">
            With Fjord Tours you can explore more of the magical fjord
            landscapes with tours and activities on and around the fjords of
            Norway
          </Text>

          <Button color="blue" fullWidth mt="md" radius="md">
            Book classic tour now
          </Button>
        </Card>

        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={400}
          mx={"auto"}
          mt={50}
        >
          <Card.Section>
            <Image
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
              height={160}
              alt="Norway"
            />
          </Card.Section>

          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Norway Fjord Adventures</Text>
          </Group>

          <Text size="sm" c="dimmed">
            With Fjord Tours you can explore more of the magical fjord
            landscapes with tours and activities on and around the fjords of
            Norway
          </Text>

          <Button color="blue" fullWidth mt="md" radius="md">
            Book classic tour now
          </Button>
        </Card>
      </Flex>
      <Contact />
    </Stack>
  );
}
