import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

function Home() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Helpdesk</h1>
      <p className="mt-2 text-sm text-gray-600">
        Server status: <span className="font-medium">{status ?? "checking..."}</span>
      </p>
    </div>
  );
}
