import { Card, Group, Input, Stack, Text, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { useState } from "react";
import { supabaseServiceRoleClient } from "~/api/server";

export const loader = async () => {
    const supabase = supabaseServiceRoleClient();

    const { data: shipments, error: shipmentsError } = await supabase
        .from("shipments")
        .select("*, forms (*)")
        .order("id", { ascending: true });

    if (shipmentsError) {
        console.log(
            `dashboard/references | referencesError: ${shipmentsError.message}`
        );
    }

    return json({ shipments });
};

export default function Deliveries() {
    const { shipments } = useLoaderData<typeof loader>();

    const location = useLocation();

    const [filter, setFilter] = useState("");

    return location.pathname == "/dashboard/deliveries/" ||
        location.pathname == "/dashboard/deliveries" ? (
        <Card withBorder radius="md" maw={1250} mx={"auto"}>
            <Group>
                <Title order={1} mb={10}>
                    Deliveries
                </Title>
                <Input
                    ml={"auto"}
                    w={400}
                    placeholder="Filter"
                    onChange={(e) => setFilter(e.target.value)}
                />
            </Group>

            {shipments?.length &&
                shipments
                    ?.filter(
                        (shipment) =>
                            shipment.id.toString().includes(filter) ||
                            shipment.forms?.name.toLowerCase().includes(filter.toLowerCase())
                    )
                    .map((shipment) => (
                        <Card
                            key={shipment.id}
                            component="a"
                            href={`/dashboard/deliveries/${shipment.id}`} // Update the href attribute
                            withBorder
                            px={30}
                            my={5}
                            h={75}
                        >
                            <Group justify="space-between">
                                <Stack align="center">
                                    <Title order={5}>Shipment</Title>
                                    <Text c={"gray"} mt={-15}>{`${shipment.id}`}</Text>
                                </Stack>
                                <Stack align="center">
                                    <Title order={5}>Form</Title>
                                    <Text c={"gray"} mt={-15}>{`${shipment.forms?.name}`}</Text>
                                </Stack>
                                <Stack align="center">
                                    <Title order={5}>Boxes</Title>
                                    <Text c={"gray"} mt={-15}>{`${shipment.boxes}`}</Text>
                                </Stack>
                                <Stack align="center">
                                    <Title order={5}>Status</Title>
                                    <Text c={"gray"} mt={-15}>{`${shipment.status}`}</Text>
                                </Stack>
                                <Stack align="center">
                                    <Title order={5}>Last Updated</Title>
                                    <Text c={"gray"} mt={-15}>{new Date(shipment.last_updated).toLocaleString()}</Text>
                                </Stack>
                            </Group>
                        </Card>
                    ))}
        </Card>
    ) : (
        <Outlet />
    );
}
