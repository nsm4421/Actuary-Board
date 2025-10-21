"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/core/shadcn/components/ui/button";

export function BackButton() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  if (!canGoBack) {
    return null;
  }

  return (
    <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full">
      뒤로가기
    </Button>
  );
}
