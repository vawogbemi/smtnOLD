import { Button, Stack, Textarea, Title } from "@mantine/core";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export function MessageCard() {
  const submit = useSubmit();
  const [message, setMessage] = useState("");
  return (
    <Stack align="center">
      <Title order={1} my={10}>
        Message
      </Title>
      <Title order={4} my={10}>
        Send text message to all customers on this shipment
      </Title>
      <form>
        <Textarea
          placeholder="Enter your message here"
          required
          w={700}
          onChange={(e) => setMessage(e.target.value)}
        ></Textarea>
        <Button
          onClick={() => submit({action: "message", message: message }, { method: "post" })}
          w={700}
          my={20}
        >
          Send
        </Button>
      </form>
    </Stack>
  );
}
