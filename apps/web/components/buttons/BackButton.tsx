
"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  label?: string;
};

export function BackButton({
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button size="lg" variant="outline" onClick={(e) => { e.preventDefault(); router.back()}} className="cursor-pointer">
      <ArrowLeft /> {label}
    </Button>
  );

}