import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../lib/auth-client";

export default function ProtectedRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
