import { Flex, Select, Text, TextInput } from "@mantine/core";
import { useState } from "react";

interface CustomInputProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
}

export function PhoneSelect({
  onChange,
  onFocus,
  onBlur,
  error,
}: CustomInputProps) {
  const data = [
    { value: "+1", label: "🇨🇦 Canada (+1)" },
    { value: "+234", label: "🇳🇬 Nigeria (+234)" },
    { value: "+44", label: "🇬🇧 United Kingdom (+44)" },
  ];
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  return (
      <Flex>
        <Select
          data={data}
          value={country}
          onChange={(_value, option) => {
            setCountry(option.value)
            onChange(option.value + phone)
          }}
          allowDeselect={false}
          w={275}
          mr={25}
          required
          label="Country"
        />
        <TextInput
          label="Phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            onChange(country + e.target.value)
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          w={"100%"}
          required
        />
        {error && <Text size='md'>{error}</Text>}
      </Flex>
  );
}
