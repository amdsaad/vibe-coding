import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

interface CategorySelectProps {
  defaultValue?: string;
  error?: boolean;
}

export function CategorySelect({ defaultValue = "developer", error }: CategorySelectProps) {
  return (
    <Select
      name="category"
      options={CATEGORIES}
      defaultValue={defaultValue}
      error={error}
    />
  );
}
