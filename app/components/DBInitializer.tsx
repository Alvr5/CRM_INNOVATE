import { useEffect } from "react";
import { db } from "~/lib/db";

export function DBInitializer() {
  useEffect(() => {
    db.seed().then(() => {
      window.dispatchEvent(new Event('crm:seed-complete'));
    }).catch(error => {
      console.error('Seed failed:', error);
    });
  }, []);

  return null;
}

// Export a function to manually trigger re-seed
export async function forceReSeed() {
  localStorage.removeItem('crm_seeded');
  await db.seed(true); // force = true
  window.dispatchEvent(new Event('crm:seed-complete'));
}

// Solo disponible en desarrollo para evitar borrados accidentales en producción.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).forceReSeed = forceReSeed;
}