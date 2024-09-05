import { Button, Group, Stack, TextInput, Title } from "@mantine/core";
import { useSubmit } from "@remix-run/react";
import { PhoneSelect } from "../Misc/PhoneSelect/PhoneSelect";
import { useState } from "react";
import { FormType } from "./NewReferenceForm";

export function CustomerCard(props: {
  form: FormType
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
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { data, form, setValue } = props;

  const submit = useSubmit();
  const [phone, setPhone] = useState("");
  const [clicked, setClicked] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  return (
    <Stack h={{ xs: 1000, sm: 800, md: 600 }} py={25}>
      <Stack mx={"auto"}>
        <Group w={"100%"} content="center">
          {" "}
          <PhoneSelect
            {...form.getInputProps("phone")}
            onChange={(value) => (
              form.setFieldValue("phone", value),
              setPhone(value),
              setClicked(false)
            )}
          ></PhoneSelect>
          <Button
            type="button"
            mb={-22.5}
            onClick={() => (
              submit(
                { action: "queryCustomer", phone: phone },
                { method: "post" }
              ),
              setClicked(true)
            )}
          >
            Submit
          </Button>
        </Group>
        {data ? (
          clicked && <>
            <Title order={4} c={"gray"}>
              Customer found
            </Title>
            <Title order={2}>{data.name}</Title>
            <Title order={4} c={"gray"}>
              {data.address}
            </Title>
            <Title order={4} c={"gray"}>
              {data.email}
            </Title>
            <Title order={4} c={"gray"}>
              Joined: {new Date(data.created_at).toLocaleString()}
            </Title>
          </>
        ) : (
          clicked &&  <>
            <Title order={4} c={"gray"}>
              Customer does not exist
            </Title>
            <Title order={2}>New customer registration</Title>
            <TextInput
              label="Name"
              w={600}
              required
              onChange={(e) => setName(e.target.value)}
            ></TextInput>
            <TextInput
              label="Email"
              w={600}
              required
              onChange={(e) => setEmail(e.target.value)}
            ></TextInput>
            <TextInput
              label="Address"
              w={600}
              required
              onChange={(e) => setAddress(e.target.value)}
            ></TextInput>
            <Button
              type="button"
              disabled={
                !phone ||
                name.length < 3 ||
                email.length < 3 ||
                address.length < 3 ||
                phone.length < 8 ||
                !phone.startsWith("+")
              }
              onClick={() =>
                submit(
                  {
                    action: "createCustomer",
                    phone: phone,
                    name: name,
                    email: email,
                    address: address,
                  },
                  { method: "post" }
                )
              }
            >
              Create new customer
            </Button>
          </>
        )}
      </Stack>
      <Group w={"100%"} content="center" mt={"auto"}>
        <Button
          type="button"
          w={150}
          disabled={!data}
          onClick={() => setValue("Receiver Information")}
        >
          Next
        </Button>
      </Group>
    </Stack>
  );
}
