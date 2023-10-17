import { Select, SelectItem } from "@nextui-org/react";
import React from "react";

const NextSelectInputField = ({
  label,
  value,
  onChange,
  optionValues,
}: {
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  optionValues: any[];
}) => {
  return (
    <Select
      label={label}
      size="sm"
      selectedKeys={value}
      onChange={onChange}
      placeholder="Select here..."
    >
      {optionValues?.map((c) => (
        <SelectItem key={c.value} value={c.value}>
          {c.name}
        </SelectItem>
      ))}
    </Select>
  );
};

export default NextSelectInputField;
