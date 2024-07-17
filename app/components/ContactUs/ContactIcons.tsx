import { Text, Box, Stack, rem, Title } from "@mantine/core";
import { IconSun, IconPhone, IconMapPin } from "@tabler/icons-react";
import classes from "./ContactIcons.module.css";

interface ContactIconProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  icon: typeof IconSun;
  title: React.ReactNode;
  description: React.ReactNode;
}

function ContactIcon({
  icon: Icon,
  title,
  description,
  ...others
}: ContactIconProps) {
  return (
    <div className={classes.wrapper} {...others}>
      <Box mr="md">
        <Icon style={{ width: rem(24), height: rem(24) }} />
      </Box>

      <div>
        <Text size="xs" className={classes.title}>
          {title}
        </Text>
        <Text className={classes.description}>{description}</Text>
      </div>
    </div>
  );
}

const data = [
  {
    title: "Canada",
    items: [
      { title: "Phone", description: "(416) 740 9716", icon: IconPhone },
      {
        title: "Address",
        description: "7490 Bath Road, Missisauga, Ontario L4T 1L2",
        icon: IconMapPin,
      },
      {
        title: "Working hours",
        description: "9 am – 5 pm Monday to Friday, 12pm - 4pm Saturday",
        icon: IconSun,
      },
    ],
  },
  {
    title: "Nigeria",
    items: [
      { title: "Phone", description: "(090) 7863 7172", icon: IconPhone },
      {
        title: "Address",
        description: "Pen Cinema, 59 Primatek Plaza, Iju Road, Agege, Lagos",
        icon: IconMapPin,
      },
      {
        title: "Working hours",
        description: "9 am – 5 pm Monday to Friday, 12pm - 4pm Saturday",
        icon: IconSun,
      },
    ],
  },
];

export function ContactIconsList() {
  const items = data.map((item) => (
    <div key={item.title}>
      <Title mt={10} order={3} className={classes.title}>
        {item.title}
      </Title>
      <Stack>
        {item.items.map((contact) => (
          <ContactIcon key={contact.title} {...contact} />
        ))}
      </Stack>
    </div>
  ));
  return <Stack>{items}</Stack>;
}
