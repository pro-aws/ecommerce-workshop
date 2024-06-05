"use client";

import * as React from "react";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { cn, getImageDimensions } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Input } from "@/components/input";
import {
  Product,
  createFile,
  createProduct,
  updateProduct,
} from "@/app/actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Star, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Label } from "@/components/label";
import { Textarea } from "@/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/alert-dialog";
import { toast } from "@/components/use-toast";
import { Icons } from "@/components/icons";

interface ProductFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "create" | "update";
  product: Product;
  backHref: string;
}

const formSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  status: z.enum(["draft", "active", "archived"], {
    message: "Must choose a status",
  }),
  images: z
    .object({
      optimisticUrl: z.string().optional(),
      id: z.string(),
      url: z.string(),
      altText: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .array(),
});

export function ProductForm({
  className,
  product,
  backHref,
  ...props
}: ProductFormProps) {
  const { shop } = useParams();
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name || "",
      description: product.description || "",
      status: product.status || "draft",
      price: product.price ? product.price / 100 : undefined,
      images: product.images || [],
    },
  });
  const { fields, append, remove, move } = useFieldArray({
    name: "images",
    control: form.control,
  });
  const [isUploading, setIsUploading] = React.useState(false);

  const isBusy =
    form.formState.isLoading || form.formState.isSubmitting || isUploading;

  async function handleDiscard() {
    form.reset(product);
  }

  const handleFileChosen = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) return;
    setIsUploading(true);

    const files = Array.from(event.target.files);
    await Promise.all(
      files.map(async (file) => {
        const { width, height, dataURL } = await getImageDimensions(file);
        // TODO: #7 This is calling our API which ultimately
        // runs the code we wrote earlier to generate a presigned URL...
        const result = await createFile({
          filename: file.name,
          contentType: file.type,
          width,
          height,
        });
        if (typeof result === "string") {
          toast({
            title: "Error uploading image",
            description: result,
            variant: "destructive",
          });
          return;
        }

        // Optimistically append the image to the form
        const optimisticImage = { ...result, optimisticUrl: dataURL };
        append(optimisticImage);

        // #8 ... and here we do a PUT with our file contents
        // to the `uploadUrl` returned from the API. Voila!
        // Upload the file to the S3 bucket
        await fetch(result.uploadUrl, {
          body: file,
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": `inline; filename="${file.name}"`,
          },
        });
      }),
    );

    setIsUploading(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    form.clearErrors();

    let result: string | Product | { status: "success" };
    if (props.mode === "create") {
      result = await createProduct({
        ...values,
        images: values.images.map((image) => image.id),
        price: values.price * 100,
      });
    } else {
      result = await updateProduct({
        ...values,
        id: product.id,
        images: values.images.map((image) => image.id),
        price: values.price * 100,
      });
    }

    if (typeof result === "string") {
      toast({
        title: "There was an issue saving your product.",
        description: result,
        variant: "destructive",
      });
      form.setError("root.serverError", { type: "custom", message: result });
      return;
    }

    router.push(`/${shop}/products`);
    router.refresh();
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form} onSubmit={onSubmit}>
        <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "h-8 w-8",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {product.name || "New Product"}
            </h1>
            {props.mode === "update" ? (
              <Badge variant="outline" className="ml-auto sm:ml-0">
                In stock
              </Badge>
            ) : null}
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button
                onClick={() => setShowDiscardDialog(true)}
                type="reset"
                variant="outline"
                size="sm"
                disabled={isBusy}
              >
                Discard
              </Button>
              <Button type="submit" size="sm" disabled={isBusy}>
                Save Product
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    Every product needs a name, description, and price. Okay,
                    the description is optional but you should probably add it
                    anyway.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              autoCapitalize="none"
                              autoComplete="off"
                              autoCorrect="off"
                              disabled={isBusy}
                              placeholder={product.name || "Blue T-Shirt"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              autoCapitalize="none"
                              autoComplete="off"
                              autoCorrect="off"
                              disabled={isBusy}
                              placeholder={
                                product.description || "This is a blue t-shirt"
                              }
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                autoCapitalize="none"
                                autoComplete="off"
                                autoCorrect="off"
                                placeholder={
                                  product.price
                                    ? (product.price / 100).toFixed(2)
                                    : "99.99"
                                }
                                disabled={isBusy}
                                min={0}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Product Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="collection">Collection</Label>
                      <Select>
                        <SelectTrigger
                          id="collection"
                          className="w-full"
                          aria-label="Select collection"
                        >
                          <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="electronics">
                            Electronics
                          </SelectItem>
                          <SelectItem value="accessories">
                            Accessories
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger aria-label="Select status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="archived">
                                    Archived
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Show your product off with high-quality images. Or whatever
                    you have available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map((field, index) => (
                      <div
                        className={cn(index === 0 && "col-span-2")}
                        key={field.id}
                      >
                        <FormField
                          control={form.control}
                          name={`images.${index}`}
                          render={({ field }) => (
                            <FormItem className="relative space-y-0">
                              <FormLabel className="sr-only">Images</FormLabel>
                              <FormControl>
                                <div className="group relative">
                                  <Image
                                    alt={field.value.altText || "Product image"}
                                    className={cn(
                                      index === 0 && "col-span-2",
                                      "w-full rounded-md",
                                      !field.value.width &&
                                        "aspect-square object-cover",
                                    )}
                                    layout="responsive"
                                    width={field.value.width || 300}
                                    height={field.value.height || 300}
                                    src={
                                      field.value.optimisticUrl ??
                                      field.value.url
                                    }
                                  />
                                  <div className="absolute inset-0 hidden bg-background/70 group-hover:block" />
                                  <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-2 group-hover:flex">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    {index !== 0 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => move(index, 0)}
                                      >
                                        <Star className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <div
                      className={cn(
                        fields.length === 0 && "col-span-2",
                        "relative flex aspect-square w-full items-center justify-center rounded-md border border-dashed focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      {isUploading ? (
                        <Icons.spinner
                          className={cn(
                            fields.length === 0 ? "h-6 w-6" : "h-4 w-4",
                            "animate-spin text-muted-foreground",
                          )}
                        />
                      ) : (
                        <Upload
                          className={cn(
                            fields.length === 0 ? "h-6 w-6" : "h-4 w-4",
                            "text-muted-foreground",
                          )}
                        />
                      )}
                      <span className="sr-only">Upload</span>
                      <input
                        disabled={isUploading}
                        onChange={handleFileChosen}
                        type="file"
                        className="absolute inset-0 opacity-0"
                        accept="image/*"
                        multiple={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 md:hidden">
            <Button
              type="reset"
              onClick={() => setShowDiscardDialog(true)}
              variant="outline"
              size="sm"
            >
              Discard
            </Button>
            <Button type="submit" size="sm">
              Save Product
            </Button>
          </div>
        </div>
      </Form>
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your changes will be permanently
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowDiscardDialog(false);
                await handleDiscard();
                toast({ description: "Your changes were discarded" });
              }}
            >
              Discard
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
