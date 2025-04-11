"use client"

import { Profile } from "@/components/profile"
import { NavigationBar } from "@/components/navigation-bar"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Profile />
      <NavigationBar />
    </div>
  )
}
