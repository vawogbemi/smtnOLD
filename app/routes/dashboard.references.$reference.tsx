import { Button, Divider, Flex, Group, Stack, Title } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import jsPDF from "jspdf";
import { supabaseServiceRoleClient } from "~/api/server";
import { BoxTable } from "~/components/BoxTable/BoxTable";
import { ShipmentTable } from "~/components/ShipmentTable/ShipmentTable";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();
  if (formData.get("action") === "delete") {
    await supabase
      .from("references")
      .delete()
      .eq("id", parseInt(params.reference as string));
  }
  return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select(
      "*, customers (id, name, phone), receivers (id, name, phone), shipments (method)"
    )
    .eq("id", params.reference!)
    .order("id", { ascending: true });

  if (referencesError) {
    console.error(`reference | referencesError: ${referencesError.message}`);
  }

  const { data: boxes, error: boxesError } = await supabase
    .from("boxes")
    .select()
    .eq("reference", params.reference!);

  if (boxesError) {
    console.error(`reference | boxesError: ${boxesError.message}`);
  }

  return {
    references,
    boxes,
  };
};

function printLabel(
  reference: number,
  sender: {
    id: number;
    name: string | null;
    phone: string;
  },
  receiver: {
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
    doc.text(`${receiver.name}\n${receiver.phone}`, 0.25, labelHeight * 0.45);

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
  const { references, boxes } = useLoaderData<typeof loader>();

  const data = (references ?? []).map((reference) => ({
    reference: reference.id,
    sender: {
      id: reference.customers?.id ?? 0,
      name: reference.customers?.name ?? "Unknown",
    },
    receiver: {
      id: reference.receivers?.id ?? 0,
      name: reference.receivers?.name ?? "Unknown",
    },
    description: reference.description,
    notes: reference.notes,
    paid: reference.paid,
    received: reference.received,
    packages: reference.packages,
    total_weight: reference.total_weight,
    small: reference.small,
    large: reference.large,
    shipping: reference.shipping,
    clearance: reference.clearance,
  }));

  const reference = references?.at(0);

  const submit = useSubmit(); 

  return (
    <Flex>
      <Stack mb={20} w={"60vw"} h={"70vh"} mx={"auto"}>
        <Title order={1} mb={10}>
          {" "}
          Reference{" "}
        </Title>
        <Group justify="space-between">
          <Group></Group>
          <Group>
            <Button
              onClick={() =>
                printLabel(
                  reference?.id ?? 0,
                  {
                    id: reference?.customers?.id ?? 0,
                    name: reference?.customers?.name ?? "Unknown",
                    phone: reference?.customers?.phone ?? "Unknown",
                  },
                  {
                    id: reference?.receivers?.id ?? 0,
                    name: reference?.receivers?.name ?? "Unknown",
                    phone: reference?.receivers?.phone ?? "Unknown",
                  },
                  boxes ?? []
                )
              }
            >
              Print Label
            </Button>
            <Button>Move Reference</Button>
            <Button bg={"red"} onClick={() => submit({action: "delete"}, {method: "post"})}>Delete Reference</Button>
          </Group>
        </Group>
        <Divider />
        <Group justify="space-between">
          <Title order={2} mb={10}>
            Details
          </Title>
          <Button
            component="a"
            href={`/dashboard/shipments/${reference?.shipment}`}
            bg={"black"}
          >
            View Shipment
          </Button>
        </Group>
        <ShipmentTable
          data={data}
          method={reference?.shipments?.method ?? ""}
        />
        {references?.at(0)?.shipments?.method === "air" && (
          <>
            <Title order={2} mb={10}>
              Boxes
            </Title>
            <BoxTable data={boxes ?? []} />
          </>
        )}
      </Stack>
    </Flex>
  );
}
