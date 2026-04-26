import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSession } from "@/server/auth";
import { useAuthStore } from "@/store/auth";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";
import { Toaster } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { authenticated, loading, setAuth } = useAuthStore();
  const checkSession = useServerFn(getSession);

  useEffect(() => {
    checkSession({}).then((res) => {
      if (res.authenticated) {
        setAuth(true, res.user.email);
      } else {
        setAuth(false, null);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {authenticated ? <Dashboard /> : <LoginPage />}
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  );
}
