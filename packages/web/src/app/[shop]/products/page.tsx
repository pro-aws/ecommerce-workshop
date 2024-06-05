import Image from "next/image";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DateTime } from "luxon";

import placeholder from "@/images/placeholder.svg";
import { Badge } from "@/components/badge";
import { Button, buttonVariants } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { listProducts } from "@/app/actions";
import Link from "next/link";
import Routes from "@/lib/routes";
import { cn, capitalise, formatPrice } from "@/lib/utils";
import { ArchiveButton } from "./archive-button";

export default async function ProductsPage({
  params,
}: {
  params: { shop: string };
}) {
  const products = await listProducts();
  if (typeof products === "string") throw new Error("Error fetching products");

  return (
    <>
      {products.length ? (
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList className="h-8 [&>*]:h-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="archived" className="hidden sm:flex">
                Archived
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Link
                className={cn(buttonVariants({ size: "sm" }), "gap-1")}
                href={await Routes.shop.products.new(params.shop)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Link>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage your products and view their sales performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Total Sales
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Created at
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(async (product) => {
                      const featuredImage = product.images?.at(0);
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="hidden sm:table-cell">
                            <Image
                              alt={
                                featuredImage?.altText ||
                                "Featured product image"
                              }
                              className="aspect-square w-[44px] rounded-md object-cover"
                              width="44"
                              height="44"
                              src={featuredImage?.url || placeholder}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {capitalise(product.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            0
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {DateTime.fromISO(product.createdAt).toRelative(
                              DateTime.DATETIME_MED,
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <Link
                                  href={await Routes.shop.products.edit(
                                    params.shop,
                                    product.slug,
                                  )}
                                >
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                </Link>
                                {product.status !== "archived" && (
                                  <ArchiveButton product={product.id} />
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              {products.length ? (
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>1-{products.length}</strong> of{" "}
                    <strong>{products.length}</strong> products
                  </div>
                </CardFooter>
              ) : null}
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex min-h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no products
            </h3>
            <p className="text-sm text-muted-foreground">
              You can start selling as soon as you add a product.
            </p>
            <Link
              className={cn(buttonVariants({ variant: "default" }), "mt-4")}
              href={await Routes.shop.products.new(params.shop)}
            >
              Add Product
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
