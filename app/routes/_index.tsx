import { Center, Title } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Smtn International" },
    { name: "Smtn International", content: "Logistics services that connect Nigeria to the World" },
  ];
};

export default function Index() {
  return (
      <Center bg={"blue"} style={{ width: '100%', height: '100vh' }}>
      <Title order={1} c={"white"}>Welcome to Smtn International</Title>
      </Center>
  );
}
