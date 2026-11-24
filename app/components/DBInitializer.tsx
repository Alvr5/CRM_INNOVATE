import { useEffect } from "react";
import { db } from "~/lib/db";

export function DBInitializer() {
  useEffect(() => {
    db.seed().then(() => {
      window.dispatchEvent(new Event('crm:seed-complete'));
    });
  }, []);

  return null;
}