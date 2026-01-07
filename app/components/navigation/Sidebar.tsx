'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { RotateCw, Home, LayoutDashboard, CheckSquare, FolderKanban, CalendarDays, StickyNote, LogOut } from "lucide-react";

export default function Sidebar() {
    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Habits', href: '/habits', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
        { name: 'Calendar', href: '/calendar', icon: CalendarDays },
        { name: 'Notes', href: '/notes', icon: StickyNote },
    ];
    
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Top - Logo and brand */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <RotateCw className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-indigo-500">Momentm</h2>
                </div>
            </div>

            {/* Middle - Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                ${isActive 
                                    ? 'bg-indigo-100 text-indigo-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom - User info */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2 px-4">
                    {user?.email}
                </div>
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
}