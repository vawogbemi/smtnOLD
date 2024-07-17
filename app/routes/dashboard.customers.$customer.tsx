import {
  Card,
  Grid,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { supabaseServiceRoleClient } from "~/api/server";
import { ReferenceTable } from "~/components/ReferenceTable";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const supabase = supabaseServiceRoleClient();

  const { data: references, error: referencesError } = await supabase
    .from("references")
    .select()
    .or(
      `sender.eq.${params.customer}, receiver.eq.${params.customer}, customer_3.eq.${params.customer}, customer_4.eq.${params.customer}, customer_5.eq.${params.customer}`
    )
    .order("id", { ascending: true });

  if (referencesError) {
    console.log(
      `dashboard.customers.$customer | referencesError: ${referencesError.message}`
    );
  }

  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: "/dashboard" },
  });
  return { references, customerId: parseInt(params.customer!) };
};


export default function Customer() {
  const { customerId, references } = useLoaderData<typeof loader>();

  const { customers } = useOutletContext<{
    customers:
      | {
          created_at: string;
          email: string | null;
          id: number;
          name: string | null;
          phone: string;
        }[]
      | null;
  }>();

  const customer =
    customers && customers.filter((customer) => customer.id == customerId)[0];

  return (
    <>
      <Tabs defaultValue="overview" orientation="vertical">
        <Tabs.List>
          <Tabs.Tab value="overview" p={20}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="references" p={20}>
            References
          </Tabs.Tab>
        </Tabs.List>
        <Card>
          <Tabs.Panel value="overview">
            <>
              <Title order={3}> Overview </Title>
              <Grid mb={10} w={1500}>
                <Grid.Col span={4}>
                  <Grid.Col span={4}>
                    <Title order={4}>Id</Title>
                    <Text>{`${customer?.id}`}</Text>
                  </Grid.Col>
                  <Title order={4}>Name</Title>
                  <Text>{`${customer?.name}`}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Title order={4}>Phone</Title>
                  <Text>{customer?.phone}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Title order={4}>Email</Title>
                  <Text>{`${customer?.email}`}</Text>
                </Grid.Col>
              </Grid>
            </>
          </Tabs.Panel>
          <Tabs.Panel value="references">
            <>
              <Title order={3}> References </Title>
              <ReferenceTable references={references ?? []} />
            </>
          </Tabs.Panel>
        </Card>
      </Tabs>
    </>
  );
}
