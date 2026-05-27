import { Outlet, useNavigate } from "react-router-dom";
import { signOut, useSession } from "../lib/auth-client";

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Helpdesk</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user.name}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
