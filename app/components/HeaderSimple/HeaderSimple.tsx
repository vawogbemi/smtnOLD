import {
  Container,
  Group,
  Burger,
  Image,
  Box,
  Drawer,
  ScrollArea,
  Divider,
  rem,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSimple.module.css";
import logo from "/logo.png";
import { useLocation } from "@remix-run/react";

export function HeaderSimple() {
  const location = useLocation();

  const links = location.pathname.startsWith("/dashboard")
    ? [
        { link: "/dashboard", label: "Dashboard" },
        { link: "/dashboard/forms", label: "Forms" },
        { link: "/dashboard/shipments", label: "Shipments" },
        { link: "/dashboard/deliveries", label: "Deliveries" },
        { link: "/dashboard/customers", label: "Customers" },
        { link: "/logout", label: "Log Out" },
      ]
    : [
        { link: "/tracking", label: "Tracking" },
        { link: "/pricing", label: "Pricing" },
        { link: "/faq", label: "FAQ" },
        { link: "/contact", label: "Contact Us" },
      ];

  const [opened, { toggle, close }] = useDisclosure(false);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={
        link.link.slice(1) == location.pathname.split("/").at(1) || undefined
      }
    >
      {link.label}
    </a>
  ));

  return (
    <Box>
      <header className={classes.header}>
        <Container size="md" className={classes.inner}>
          <Anchor href="/">
            <Image src={logo} h={85} />
          </Anchor>
          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
        </Container>
      </header>
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />
          {items}
          <Divider my="sm" />
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
