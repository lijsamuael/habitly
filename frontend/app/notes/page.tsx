"use client"

import { NotesDiary } from "@/components/notes-diary"
import { NavigationBar } from "@/components/navigation-bar"

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NotesDiary />
      <NavigationBar />
    </div>
  )
}
