import {
  Button,
  Card,
  Checkbox,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { redirect, useLoaderData, useSubmit } from "@remix-run/react";
import { sendSms, supabaseServiceRoleClient } from "~/api/server";
import { PhoneSelect } from "~/components/PhoneSelect/PhoneSelect";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  //select latest shipment
  const { data: shipments, error: shipmentError } = await supabase
    .from("shipments")
    .select()
    .eq("form", params.form!)
    .order("created_at", { ascending: false });

  if (shipmentError) {
    console.log(
      `dashboard/forms/$form | shipmentError: ${shipmentError.message}`
    );
  }

  const shipment = shipments?.at(0);

  //get total weight of box
  let total_weight = 0;

  for (
    let i = 1;
    i < parseInt(formData.get("number_of_boxes") as string) + 1;
    i++
  ) {
    total_weight += parseInt(formData.get(`weight_${i}`) as string);
  }

  //create reference
  const { data: references, error: referenceError } = await supabase
    .from("references")
    .insert({
      form: parseInt(params.form!),
      shipment: shipment!.id,
      description: formData.get("description") as string,
      boxes: parseInt(formData.get("number_of_boxes") as string),
      paid: false,
      received: false,
      delivery: false,
      total_weight: total_weight,
    })
    .select();

  if (referenceError) {
    console.log(
      `dashboard/forms/$form | referenceError: ${referenceError.message}`
    );
  }

  const reference = references?.at(0);

  //create boxes
  const boxes = [
    ...Array(parseInt(formData.get("number_of_boxes") as string)).keys(),
  ].map((i) => ({
    number: shipment!.boxes + i + 1,
    reference: reference!.id,
    length: parseInt(formData.get(`length_${i + 1}`) as string),
    width: parseInt(formData.get(`width_${i + 1}`) as string),
    height: parseInt(formData.get(`height_${i + 1}`) as string),
    weight: parseInt(formData.get(`weight_${i + 1}`) as string),
  }));

  const { error: boxesError } = await supabase.from("boxes").insert(boxes);

  if (boxesError) {
    console.log(`dashboard/forms/$form | boxesError: ${boxesError.message}`);
  }

  //increment shipment boxes
  const { error: incrementError } = await supabase.rpc("increment", {
    table_name: "shipments",
    row_id: shipment!.id,
    x: parseInt(formData.get("number_of_boxes") as string),
    field_name: "boxes",
  });

  if (incrementError) {
    console.log(incrementError);
  }

  const body =
    "SMTN: Your reference number is " +
    reference!.id +
    ". \n Follow this link to fill out details: " +
    "www.smtninternational.com/forms/" +
    reference?.form +
    "/reference/" +
    reference!.id +
    "\n Thank you, \n SMTN International";

  sendSms({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: formData.get("phone") as string,
    body: body,
  });

  return redirect("/dashboard/forms");
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: forms } = await supabase
    .from("forms")
    .select()
    .eq("id", params.form!);

  if (forms && forms?.length > 0) {
    return json({
      data: forms?.at(0),
    });
  }

  return redirect("/dashboard/forms");
};

export default function Form() {
  const { data } = useLoaderData<typeof loader>();

  const form = useForm({
    initialValues: {
      phone: "",
      description: "",
      notes: "",
      number_of_boxes: 1,
      boxes: [{ length: 1, width: 1, height: 1, weight: 1 }],
      paid: false,
    },
    validate: {
      phone: (val) =>
        /^\+\d+$/.test(val)
          ? (val.length < 5 ? null : 'Length must be less than 5 characters')
          : "Phone number is missing country code",
    },
  });

  const submit = useSubmit();

  return (
    <Card withBorder radius="md" px={{ md: 200, lg: 300, xl: 400 }}>
      <Stack mb={"lg"}>
        <Title order={3} c={"gray"} mb={-10}>{`Form ${data?.id}`}</Title>
        <Title order={1}>{data!.name}</Title>
      </Stack>
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
            submit(values, { method: "post" })
          )
        )}
      >
        <Stack>
          <PhoneSelect
            {...form.getInputProps("phone")}
            onChange={(value) => form.setFieldValue("phone", value)}
          />
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
            onChange={()=>console.log(form.getTransformedValues())}
          />
          <NumberInput
            min={1}
            radius="md"
            label="Number of Boxes"
            stepHoldDelay={500}
            stepHoldInterval={100}
            clampBehavior="strict"
            onValueChange={(values) => {
              values.floatValue &&
                form.setValues((prev) => ({
                  ...prev,
                  ...prev.boxes?.splice(
                    prev.boxes.length -
                      (prev.boxes.length - values.floatValue!),
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
                        form.setFieldValue(
                          `boxes.${index}.weight`,
                          Math.ceil(
                            (form.getTransformedValues()["boxes"][index][
                              "length"
                            ] *
                              form.getTransformedValues()["boxes"][index][
                                "width"
                              ] *
                              form.getTransformedValues()["boxes"][index][
                                "height"
                              ]) /
                              366
                          )
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
                        form.setFieldValue(
                          `boxes.${index}.weight`,
                          Math.ceil(
                            (form.getTransformedValues()["boxes"][index][
                              "length"
                            ] *
                              form.getTransformedValues()["boxes"][index][
                                "width"
                              ] *
                              form.getTransformedValues()["boxes"][index][
                                "height"
                              ]) /
                              366
                          )
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
                        form.setFieldValue(
                          `boxes.${index}.weight`,
                          Math.ceil(
                            (form.getTransformedValues()["boxes"][index][
                              "length"
                            ] *
                              form.getTransformedValues()["boxes"][index][
                                "width"
                              ] *
                              form.getTransformedValues()["boxes"][index][
                                "height"
                              ]) /
                              366
                          )
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
                />
              </Group>
            </Stack>
          ))}
          <Checkbox
            mt="md"
            label="Paid"
            {...form.getInputProps("paid", { type: "checkbox" })}
          />
        </Stack>
        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl">
            Submit
          </Button>
        </Group>
      </form>
    </Card>
  );
}
