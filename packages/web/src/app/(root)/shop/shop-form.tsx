"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, createSlug } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Input } from "@/components/input";
import { createShop } from "@/app/actions";
import { useRouter } from "next/navigation";

interface ShopFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(3, "Must be at least 3 characters")
    .regex(/^[a-z]+[a-z0-9\-]+$/, "Must be lowercase, URL friendly."),
});

export function ShopForm({ className, ...props }: ShopFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const isLoading =
    form.formState.isLoading ||
    form.formState.isSubmitting ||
    form.formState.isSubmitSuccessful;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    form.clearErrors();
    const result = await createShop({
      name: values.name,
      slug: values.slug,
      baseUrl: `${window.location.protocol}//${window.location.host}`,
    });
    if (typeof result === "string") {
      form.setError("slug", { type: "custom", message: result });
      return;
    }
    router.push(`/${result.slug}`);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form} onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Shop"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => {
                    if (!form.getFieldState("slug").isDirty)
                      form.setValue("slug", createSlug(e.target.value));
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="acme-shop"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Needs to be lowercase, unique, and URL friendly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create Shop
        </Button>
      </Form>
    </div>
  );
}
