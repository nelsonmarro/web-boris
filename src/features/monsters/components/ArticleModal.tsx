'use client';

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription 
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ArticleModalProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ArticleModal({ children, title, description }: ArticleModalProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-card border-border shadow-2xl">
          <div className="p-6 md:p-10">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={true} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] bg-card border-border">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{title || "Artículo"}</DrawerTitle>
          <DrawerDescription>{description || "Vista rápida del artículo"}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 pb-12">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
