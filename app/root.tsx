import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./app.css";
import { AuthProvider } from "~/context/AuthContext";
import { isSupabaseConfigured } from "~/lib/db/client";
import { DBInitializer } from "./components/DBInitializer";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Falta configurar Supabase</h1>
          <p className="text-sm text-gray-600">
            La aplicación necesita las credenciales del proyecto. Copia{" "}
            <code className="bg-gray-100 px-1 rounded">.env.example</code> a{" "}
            <code className="bg-gray-100 px-1 rounded">.env</code> y completa:
          </p>
          <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-4 overflow-x-auto">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica`}
          </pre>
          <p className="text-sm text-gray-600">
            En producción, define esas mismas variables en el panel del proveedor
            (Vercel, Docker, etc.) y vuelve a compilar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <AuthProvider>
      <DBInitializer />
      <Outlet />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "¡Ups!";
  let details = "Ha ocurrido un error inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "La página solicitada no se encuentra."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">{message}</h1>
      <p className="text-gray-600 mt-2">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto mt-4 bg-gray-100 rounded">
          <code className="text-sm">{stack}</code>
        </pre>
      )}
    </main>
  );
}