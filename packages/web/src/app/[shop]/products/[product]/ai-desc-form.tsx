"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Product, generateProductDescription } from "@/app/actions";
import { CornerDownLeft, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Textarea } from "@/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { toast } from "@/components/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Icons } from "@/components/icons";

interface AiDescFormProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Product;
  name?: string;
  description?: string;
  price?: number;
  onGenerated?: (description: string) => void;
}

const formSchema = z.object({
  prompt: z.string().min(1, "Please provide a prompt"),
  tone: z.enum([
    "expert",
    "daring",
    "playful",
    "sophisticated",
    "persuasive",
    "supportive",
  ]),
});

export function AiDescForm({
  className,
  product,
  name,
  description,
  price,
  onGenerated,
  ...props
}: AiDescFormProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      tone: "supportive",
    },
  });

  const isBusy = form.formState.isLoading || form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    form.clearErrors();

    const response = await generateProductDescription({
      ...values,
      name: name || undefined,
      description: description || undefined,
      price: price || undefined,
    });
    if (typeof response === "string") {
      toast({
        title: "Failed to generate a description",
        description: response,
        variant: "destructive",
      });
      return;
    }

    setOpen(false);
    form.reset();

    setTimeout(() => {
      onGenerated?.(response.description);
    }, 300);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" className="h-4 px-2">
            <Sparkles className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent asChild className="min-w-96 p-0">
          <Card>
            <CardHeader>
              <CardTitle>Generate product description</CardTitle>
              <CardDescription>
                Through the power of ARTIFICIAL INTELLIGENCE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form
                {...form}
                onSubmit={onSubmit}
                stopPropagation
                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        Features and keywords
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isBusy}
                          autoCapitalize="none"
                          autoComplete="off"
                          autoCorrect="off"
                          placeholder={[
                            "Features and keywords",
                            "ie, organic cotton, relaxed fit, bulbous, smelly",
                          ].join("\n")}
                          className="min-h-24 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)(e);
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end p-3 pt-0">
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Tone</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isBusy}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-[175px]">
                              <div className="flex justify-start gap-1">
                                <div>Tone:</div>
                                <SelectValue placeholder="Supportive" />
                              </div>
                            </SelectTrigger>
                            <SelectContent defaultValue="supportive">
                              <SelectItem value="expert">Expert</SelectItem>
                              <SelectItem value="daring">Daring</SelectItem>
                              <SelectItem value="playful">Playful</SelectItem>
                              <SelectItem value="sophisticated">
                                Sophisticated
                              </SelectItem>
                              <SelectItem value="persuasive">
                                Persuasive
                              </SelectItem>
                              <SelectItem value="supportive">
                                Supportive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="ml-auto gap-1.5"
                    disabled={isBusy}
                  >
                    Generate
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </Form>
            </CardContent>
            {isBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
