import {
  Title,
  SimpleGrid,
} from "@mantine/core";

import { ContactIconsList } from "./ContactIcons";
import classes from "./ContactUs.module.css";


export function ContactUs() {


  return (
    <div className={classes.wrapper}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={50}>
        <div>
          <Title className={classes.title}>Contact us</Title>

          <ContactIconsList />

        </div>

      </SimpleGrid>
    </div>
  );
}
