"use client";

import * as React from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { Button } from "@/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import type { Shop } from "@/app/actions";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface ShopSwitcherProps extends PopoverTriggerProps {
  shops: Shop[];
}

export function ShopSwitcher({ className, shops }: ShopSwitcherProps) {
  const router = useRouter();
  const path = usePathname();
  const { shop } = useParams();
  const defaultShop = shops.find((s) => s.slug === shop) || shops[0];

  const [open, setOpen] = React.useState(false);
  const [showNewShopDialog, setShowNewShopDialog] = React.useState(false);
  const [selectedShop, setSelectedShop] = React.useState<Shop>(defaultShop);
  const currentPath = path.split(`/${shop}/`)[1] || "dashboard";

  React.useEffect(() => {
    router.push(`/${selectedShop.slug}/${currentPath}`);
  }, [selectedShop, currentPath]);

  return (
    <Dialog open={showNewShopDialog} onOpenChange={setShowNewShopDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a shop"
            className={cn("w-[200px] justify-between", className)}
          >
            <Avatar className="mr-2 h-5 w-5">
              {/* <AvatarImage */}
              {/*   src={`https://avatar.vercel.sh/${selectedShop.value}.png`} */}
              {/*   alt={selectedShop.label} */}
              {/*   className="grayscale" */}
              {/* /> */}
              <AvatarFallback>{selectedShop.name[0]}</AvatarFallback>
            </Avatar>
            {selectedShop.name}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search shop..." />
              <CommandEmpty>No shop found.</CommandEmpty>
              <CommandGroup heading="Shops">
                {shops.map((shop) => (
                  <CommandItem
                    key={shop.id}
                    onSelect={() => {
                      setSelectedShop(shop);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      {/* <AvatarImage */}
                      {/*   src={`https://avatar.vercel.sh/${shop.value}.png`} */}
                      {/*   alt={shop.label} */}
                      {/*   className="grayscale" */}
                      {/* /> */}
                      <AvatarFallback>{shop.slug[0]}</AvatarFallback>
                    </Avatar>
                    {shop.slug}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedShop.id === shop.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <Link href="/shop">
                    <CommandItem>
                      <PlusCircledIcon className="mr-2 h-5 w-5" />
                      Create Shop
                    </CommandItem>
                  </Link>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Dialog>
  );
}
