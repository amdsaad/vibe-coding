"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { deleteProfile } from "@/actions/profile";

export function DeleteProfileButton() {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleFirstClick() {
    setConfirming(true);
    timerRef.current = setTimeout(() => setConfirming(false), 3000);
  }

  if (confirming) {
    return (
      <form action={deleteProfile}>
        <Button type="submit" variant="destructive" size="sm">
          CONFIRM DELETE
        </Button>
      </form>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleFirstClick}
      className="text-red-500 hover:text-red-600"
    >
      DELETE PROFILE
    </Button>
  );
}
