import {
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst } from "@mantine/hooks";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { sendSms, supabaseServiceRoleClient } from "~/api/server";
import { PhoneSelect } from "~/components/PhoneSelect/PhoneSelect";
import { jsPDF } from "jspdf";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  if (formData.get("action") == "add-customer") {
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select()
      .eq("phone", formData.get("phone") as string);

    if (customerError) {
      console.error(customerError);
    }
    const customer = customers?.at(0);

    if (customer) {
      switch (formData.get("role")) {
        case "sender":
          await supabase
            .from("references")
            .update({ sender: customer.id })
            .eq("id", params.reference!);
          break;
        case "receiver":
          await supabase
            .from("references")
            .update({ receiver: customer.id })
            .eq("id", params.reference!);
          break;
        case "customer_3":
          await supabase
            .from("references")
            .update({ customer_3: customer.id })
            .eq("id", params.reference!);
          break;
        case "customer_4":
          await supabase
            .from("references")
            .update({ customer_4: customer.id })
            .eq("id", params.reference!);
          break;
        case "customer_5":
          await supabase
            .from("references")
            .update({ customer_5: customer.id })
            .eq("id", params.reference!);
          break;
      }

      const body =
        "Welcome back " +
        customer.name +
        "!\n Your reference number is " +
        params.reference +
        ".\n Your tracking number: www.smtninternational.com/tracking/" +
        params.reference! +
        ".\n Your invoice can be found here: www.smtninternational.com/invoice/" +
        params.reference! +
        "\n If you have any questions, please visit www.smtninternational.com/faq" +
        "\n If you want to contact us, please visit www.smtninternational.com/contact" +
        "\n Thank you, \n SMTN International";

      sendSms({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: customer.phone,
        body: body,
      }).catch((err) => console.log(`Twilio Error ${err}`));

      return redirect(`/dashboard/references/${params.reference}`);
    }

    return redirect(
      `/dashboard/customers/new/${params.reference}/${formData
        .get("phone")
        ?.slice(1)}/${formData.get("role")}`
    );
  }

  if (formData.get("action") == "customer-paid") {
    const { error: referenceError } = await supabase
      .from("references")
      .update({
        paid: true,
      })
      .eq("id", params.reference!);

    if (referenceError) {
      console.error(referenceError);
    }

    return redirect(`/dashboard/references/${params.reference}`);
  }

  return redirect(`/dashboard/references/${params.reference}`);
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select("*")
    .eq("id", params.reference!);

  if (referencesError) {
    console.error(referencesError);
  }

  const { data: boxes, error: boxesError } = await supabase
    .from("boxes")
    .select()
    .eq("reference", params.reference!);

  if (boxesError) {
    console.error(boxesError);
  }

  const reference = references?.at(0);

  const {data: customers, error: customersError} = await supabase.from("customers").select("*").eq("id", reference!.sender)
  
  const sender = customers?.at(0)

  if (customersError) {
    console.error(customersError)
  }
  
  const { data: receivers, error: receiversError } = await supabase
    .from("receivers")
    .select()
    .in("id", [
      reference?.receiver ?? 0,
      reference?.customer_3 ?? 0,
      reference?.customer_4 ?? 0,
      reference?.customer_5 ?? 0,
    ]);

  const receiver = receivers?.at(0);

  if (receiversError) {
    console.error(receiversError);
  }

  if (references?.length && boxes?.length) {
    return { reference: references?.at(0), boxes: boxes, sender: sender, receiver: receiver, receivers: receivers?.slice(1) };
  }
  return redirect("/dashboard/references");
};

function CustomerCard(props: {
  customer: {
    created_at: string;
    id: number;
    name: string | null;
    phone: string;
  };
  index: number;
}) {
  const { customer, index } = props;

  const customer_map = [
    "sender",
    "receiver",
    "customer_3",
    "customer_4",
    "customer_5",
  ];

  const form = useForm({
    initialValues: {
      phone: "",
    },
    validate: {
      phone: (val) =>
        /^\+\d+$/.test(val)
          ? val.length > 5
            ? null
            : "Length must be greater than 5 characters"
          : "Phone number is missing country code",
    },
  });

  const [edit, setEdit] = useState(false);

  const submit = useSubmit();

  return (
    <Card withBorder mt={10}>
      <form
        onSubmit={form.onSubmit((values) =>
          submit(
            {
              ...values,
              action: "edit-customer",
            },
            { method: "post" }
          )
        )}
      >
        <Flex>
          <Stack>
            <Title order={4}>{upperFirst(customer_map[index])}</Title>
            <Title
              order={5}
              c={"gray"}
              mt={-20}
              mb={20}
            >{`${customer.name}`}</Title>
          </Stack>
          <Button
            type="button"
            ml="auto"
            onClick={() => setEdit((prev) => !prev)}
          >
            Edit
          </Button>
        </Flex>

        {edit ? (
          <>
            <PhoneSelect
              {...form.getInputProps("phone")}
              onChange={(value) => form.setFieldValue("phone", value)}
            />
            <Button mt={10} type="submit">
              Add Customer
            </Button>
          </>
        ) : (
          <>
            <Flex>
              <Text>{`${customer.phone}`}</Text>
            </Flex>
          </>
        )}
      </form>
    </Card>
  );
}

function printLabel(
  reference: number,
  sender: {
    created_at: string;
    email: string | null;
    id: number;
    name: string | null;
    phone: string;
    address: string
  },
  receiver: {
    created_at: string;
    id: number;
    name: string | null;
    phone: string;
  },
  boxes: {
    created_at: string;
    height: number;
    id: number;
    length: number;
    number: number;
    reference: number;
    weight: number;
    width: number;
  }[]
) {
  // Define label dimensions
  const labelWidth = 4; // inches
  const labelHeight = 6; // inches

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [labelWidth, labelHeight],
  });

  // Iterate through each label
  boxes.forEach((box, index) => {
    // Add a new page for each label
    if (index > 0) {
      doc.addPage();
    }

    // Set the cursor position for the current label
    doc.setLineWidth(0.01);
    doc.setFont("helvetica", "bold");

    // Draw sender information
    doc.setFontSize(9);
    doc.text("From:", 0.25, 0.25);
    doc.text(`${sender.name}\n${sender.phone}`, 0.25, 0.5);

    // Draw a horizontal line to separate sender and recipient sections
    doc.line(0, labelHeight * 0.25, labelWidth, labelHeight * 0.25);

    // Draw recipient information
    doc.setFontSize(20);
    doc.text("To:", 0.25, labelHeight * 0.35);
    doc.text(
      `${receiver.name}\n${receiver.phone}`,
      0.25,
      labelHeight * 0.45
    );

    doc.setFontSize(9);
    // Draw shipping details
    doc.text(`Weight: ${box.weight}`, labelWidth * 0.55, 0.5);
    doc.text(`Length: ${box.length}`, labelWidth * 0.55, 0.65);
    doc.text(`Width: ${box.width}`, labelWidth * 0.55, 0.8);
    doc.text(`Height: ${box.height}`, labelWidth * 0.55, 0.95);
    doc.text(`Reference: ${reference}`, labelWidth * 0.55, 1.1);

    // Draw reference
    doc.setFontSize(35);
    doc.text(`${box.number}`, labelWidth * 0.4, labelHeight * 0.85);

    // Draw a vertical line to separate recipient and shipping details
    doc.line(
      (labelWidth * 8) / 16,
      0,
      (labelWidth * 8) / 16,
      labelHeight * 0.25
    );
  });

  // Save the PDF
  doc.save("shipping_labels.pdf");
}

export default function Reference() {
  const { reference, boxes, sender, receiver, receivers } = useLoaderData<typeof loader>();

  const customer_map = [
    "customer_3",
    "customer_4",
    "customer_5",
  ];

  const submit = useSubmit();

  const form = useForm({
    initialValues: {
      phone: "",
    },
    validate: {
      phone: (val) =>
        /^\+\d+$/.test(val)
          ? val.length > 5
            ? null
            : "Length must be greater than 5 characters"
          : "Phone number is missing country code",
    },
  });

  const [addDelivery, setAddDelivery] = useState(false);

  return (
    <Card withBorder radius="md" px={{ md: 200, lg: 300, xl: 400 }}>
      <Flex>
        <Stack mb={"lg"}>
          <Title order={1}>Reference</Title>
          <Title
            order={3}
            c={"gray"}
            mt={-20}
            mb={-10}
          >{`#${reference?.id}`}</Title>
        </Stack>
        <Group ml={"auto"}>
            <Button
              onClick={() =>
                printLabel(
                  reference!.id,
                  sender!,
                  receiver!,
                  boxes
                )
              }
            >
              Print Label
            </Button>
          <Tooltip label="Needs either sender or receiver to be set">
            <Button disabled={!reference?.sender && !reference?.receiver}>
              Send Sms
            </Button>
          </Tooltip>
          <Button
            bg={"red"}
            onClick={() => alert("You do not have permission to do this")}
          >
            Delete Reference
          </Button>
        </Group>
      </Flex>

      <Card>
        <Grid mb={10}>
          <Grid.Col span={4}>
            <Title order={4}>Shipment</Title>
            <Text>{`${reference?.shipment}`}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Title order={4}>Created</Title>
            <Text>{new Date(reference!.created_at).toLocaleString()}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Title order={4}>Boxes</Title>
            <Text>{`${reference?.packages}`}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Title order={4}>Total Weight</Title>
            <Text>{`${reference?.total_weight} kg`}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Title order={4}>Paid</Title>
            {reference?.paid ? (
              <IconCheck size={10} color="green" />
            ) : (
              <IconX size={10} color="red" />
            )}
          </Grid.Col>
          <Grid.Col span={4}>
            <Title order={4}>Recieved</Title>
            {reference?.received ? (
              <IconCheck size={10} color="green" />
            ) : (
              <IconX size={10} color="red" />
            )}
          </Grid.Col>
          <Grid.Col span={4}>
            <Title order={4}>Delivery</Title>
            {reference?.delivery ? (
              <IconCheck size={10} color="green" />
            ) : (
              <IconX size={10} color="red" />
            )}
          </Grid.Col>
        </Grid>
        <Stack mt={40}>
          <Title order={4}>Description</Title>
          <Text mt={-10}>{`${reference?.description}`}</Text>
        </Stack>
        <Stack>
          <Title order={4}>Notes</Title>
          <Text mt={-10}>{`${reference?.notes}`}</Text>
        </Stack>
      </Card>

      <Title order={2}>Boxes</Title>
      <Card>
        <Tabs defaultValue={"0"}>
          <Tabs.List>
            {boxes.map((_, index) => (
              <Tabs.Tab key={index} value={index.toString()}>
                {index + 1}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {boxes.map((box, index) => (
            <Tabs.Panel key={index} value={index.toString()}>
              <Grid>
                <Grid.Col span={4}>
                  <Title order={4}>Length</Title>
                  <Text>{`${box.length}`}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Title order={4}>Width</Title>
                  <Text>{`${box.width}`}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Title order={4}>Height</Title>
                  <Text>{`${box.height}`}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Title order={4}>Weight</Title>
                  <Text>{`${box.weight}`}</Text>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card>
      <Title order={2}>Customers</Title>
      {receivers!.map(
        (customer, index) =>
          customer && (
            <CustomerCard key={index} customer={customer} index={index} />
          )
      )}
      {receivers && receivers.length < 3 && (
        <Card withBorder radius="md" my={20}>
          <form
            onSubmit={form.onSubmit((values) =>
              submit(
                {
                  ...values,
                  action: "add-customer",
                  role: customer_map[receivers!.length],
                },
                { method: "post" }
              )
            )}
          >
            <Title order={4}>Add {customer_map[receivers!.length]}</Title>
            <PhoneSelect
              {...form.getInputProps("phone")}
              onChange={(value) => form.setFieldValue("phone", value)}
            />
            <Button mt={10} type="submit">
              Add Customer
            </Button>
          </form>
        </Card>
      )}

      <Title order={2}>Delivery</Title>
      <Card>
        {reference?.delivery ? (
          <></>
        ) : addDelivery ? (
          <></>
        ) : (
          <Stack align="center">
            <Text>Deliver not yet scheduled</Text>
            <Button onClick={() => setAddDelivery((prev) => !prev)}>
              Add Delivery
            </Button>
          </Stack>
        )}
      </Card>
    </Card>
  );
}
