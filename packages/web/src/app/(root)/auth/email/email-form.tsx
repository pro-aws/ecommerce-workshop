"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Input } from "@/components/input";
import { signin } from "@/app/actions";

interface EmailFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "You must provide a valid email address" }),
});

export function EmailForm({ className, ...props }: EmailFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const isBusy =
    form.formState.isLoading ||
    form.formState.isSubmitting ||
    form.formState.isSubmitSuccessful;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    return await signin(values.email);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form} onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isBusy}>
          {isBusy && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In with Email
        </Button>
      </Form>
    </div>
  );
}
