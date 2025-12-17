"use client";
import { logoutAction } from "./logoutAction";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={async () => await logoutAction()}
      className="hover:opacity-80 transition-opacity cursor-pointer"
      title="Logout"
    >
      <LogOut size={24} />
    </button>
  );
}
