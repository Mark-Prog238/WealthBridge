import { logout } from "@/app/utils/actions";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-slate-950 min-h-screen min-w-screen rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        Welcome to the Dashboard
      </h1>
      <form action={logout}>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
