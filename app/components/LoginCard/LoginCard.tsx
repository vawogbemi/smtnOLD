import { Text, Paper, Group } from "@mantine/core";
import { GoogleButton } from "./GoogleButton";
import { SupabaseClient } from "@supabase/supabase-js";

export function LoginCard(props: { supabase: SupabaseClient}) {

  const {supabase} = props
  
  return (
    <Paper radius="md" p="xl" withBorder maw={1000} mx={"auto"} >
      <Text size="lg" fw={500}>
        Login with
      </Text>

      <Group grow mb="md" mt="md">
        <GoogleButton
          radius="xl"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `/auth/callback`,
              },
            })
          }
        >
          Google
        </GoogleButton>
      </Group>
    </Paper>
  );
}
