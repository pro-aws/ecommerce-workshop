"use client";

import * as React from "react";

import { DropdownMenuItem } from "@/components/dropdown-menu";
import { archiveProduct } from "@/app/actions";
import { useRouter } from "next/navigation";

interface ArchiveButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  product: string;
}

export function ArchiveButton({ product }: ArchiveButtonProps) {
  const router = useRouter();
  const handleArchive = async () => {
    await archiveProduct(product);
    router.refresh();
  };
  return <DropdownMenuItem onClick={handleArchive}>Archive</DropdownMenuItem>;
}
