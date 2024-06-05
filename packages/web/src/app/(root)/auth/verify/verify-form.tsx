"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/input-otp";
import { useSearchParams } from "next/navigation";
import { Icons } from "@/components/icons";
import { authCallback } from "@/app/actions";
import React from "react";

const FormSchema = z.object({
  code: z.string().min(6, {
    message: "Your verification code must be 6 characters.",
  }),
});

interface VerifyFormProps extends React.HTMLAttributes<HTMLDivElement> {
  authUrl: string;
}

export function VerifyForm({ className, authUrl, ...props }: VerifyFormProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
    },
  });

  const isBusy =
    form.formState.isLoading ||
    form.formState.isSubmitting ||
    form.formState.isSubmitSuccessful;

  React.useEffect(() => {
    if (error === "invalid_code")
      form.setError("code", {
        type: "custom",
        message: "The code is invalid, try again.",
      });
  }, [error]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    return await authCallback(data.code);
  }

  return (
    <Form {...form} onSubmit={onSubmit}>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem className="flex flex-col items-center">
            <FormLabel className="sr-only">Verification Code</FormLabel>
            <FormControl>
              <InputOTP maxLength={6} disabled={isBusy} {...field}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full" disabled={isBusy}>
        {isBusy && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Submit
      </Button>
    </Form>
  );
}
