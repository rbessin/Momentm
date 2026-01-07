// app/dashboard/page.tsx
"use client";

import { createClient } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const supabase = createClient();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-indigo-500 mb-4">
            Welcome to Momentm
          </h1>
          <p className="text-indigo-300 mb-4">
            Logged in as: {user?.email}
          </p>
          
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}