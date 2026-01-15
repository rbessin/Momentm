"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  RotateCw,
  Home,
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  StickyNote,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Habits", href: "/habits", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Notes", href: "/notes", icon: StickyNote },
  ];

  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-stone-50 border-r border-stone-200 flex flex-col">
      {/* Top - Logo and brand */}
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-emerald-700">Momentm</h2>
        </div>
      </div>

      {/* Middle - Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                                flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-sm
                                ${
                                  isActive
                                    ? "bg-emerald-100 text-emerald-700 font-medium"
                                    : "text-stone-700 hover:bg-stone-200"
                                }
                            `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom - User info */}
      <div className="p-3 border-t border-stone-200">
        <div className="text-xs text-stone-600 mb-2 px-3 truncate">
          {user?.email}
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-stone-700 hover:bg-stone-200 hover:text-stone-900 transition-colors w-full text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
