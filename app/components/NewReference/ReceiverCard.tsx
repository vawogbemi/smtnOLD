import { Button, Group, Stack, TextInput } from "@mantine/core";
import { PhoneSelect } from "../PhoneSelect/PhoneSelect";
import { useState } from "react";
import { FormType } from "./NewReferenceForm";

export function ReceiverCard(props: {
  form: FormType
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { form, setValue } = props;
 
  const [phone, setPhone] = useState("");

  return (
    <Stack h={{ xs: 1000, sm: 800, md: 600 }} py={25}>
      <Stack>
        <Group w={"100%"} content="center">
          {" "}
          <TextInput
            {...form.getInputProps("receiver_name")}
            label="Receiver Name"
            w={600}
            required
          ></TextInput>
        </Group>
        <Group w={"100%"} content="center">
          {" "}
          <PhoneSelect
            {...form.getInputProps("receiver_phone")}
            onChange={(value) => (form.setFieldValue("receiver_phone", value), setPhone(value))}
          ></PhoneSelect>
        </Group>
      </Stack>
      <Group w={"100%"} content="center" mt={"auto"}>
        <Button
          type="button"
          w={150}
          bg={"gray"}
          onClick={() => setValue("Customer Information")}
        >
          Back
        </Button>
        <Button
          type="button"
          w={150}
          onClick={() => setValue("Package Information")}
          disabled={!form.getValues().receiver_name || !phone || phone.length < 8 || !phone.startsWith("+")}
        >
          Next
        </Button>
      </Group>
    </Stack>
  );
}
