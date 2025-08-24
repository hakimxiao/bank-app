import z from "zod";
import { FormControl, FormField, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

import { Control, FieldPath } from "react-hook-form";
import { authFormSchema } from "@/lib/utils";

const formSchema = authFormSchema("sign-up");

interface CustomInputFormProps {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>; // ****** solusi paling efektif untuk name di form field karena kita menggunakan react hook form yang merujuk langsung ke zod, bukan string dan cara ini juga akan dinamis dimana jika validasi zod di tambah maka akan secara otomatis dikenali
  label: string;
  placeholder: string;
}

const CustomInputForm = ({
  control,
  name,
  label,
  placeholder,
}: CustomInputFormProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                placeholder={placeholder}
                type={
                  name === "password"
                    ? "password"
                    : name === "email"
                    ? "email"
                    : "text"
                }
                className="input-class"
                {...field}
              />
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </div>
      )}
    />
  );
};

export default CustomInputForm;
