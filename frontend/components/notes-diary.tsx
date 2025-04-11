"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, Trash2 } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  date: string
}

export function NotesDiary() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("habitly_notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    // Save notes to localStorage when they change
    localStorage.setItem("habitly_notes", JSON.stringify(notes))
  }, [notes])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `Note - ${format(new Date(), "MMM d, yyyy")}`,
      content: "",
      date: new Date().toISOString(),
    }

    setTitle(newNote.title)
    setContent(newNote.content)
    setActiveNote(newNote)
    setIsEditing(true)
  }

  const saveNote = () => {
    if (!activeNote) return

    const updatedNote = {
      ...activeNote,
      title,
      content,
      date: new Date().toISOString(),
    }

    if (notes.find((note) => note.id === activeNote.id)) {
      // Update existing note
      setNotes(notes.map((note) => (note.id === activeNote.id ? updatedNote : note)))
    } else {
      // Add new note
      setNotes([updatedNote, ...notes])
    }

    setActiveNote(updatedNote)
    setIsEditing(false)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNote?.id === id) {
      setActiveNote(null)
      setTitle("")
      setContent("")
      setIsEditing(false)
    }
  }

  const selectNote = (note: Note) => {
    setActiveNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(false)
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes & Diary</h1>
        <Button onClick={createNewNote} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div key={note.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`cursor-pointer ${activeNote?.id === note.id ? "border-purple-500 bg-purple-950/20" : "bg-gray-900"}`}
                  onClick={() => selectNote(note)}
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-medium truncate">{note.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNote(note.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">{format(new Date(note.date), "MMM d, yyyy - h:mm a")}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-300 line-clamp-2">{note.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <div className="md:col-span-2">
          {activeNote ? (
            <Card className="bg-gray-900">
              <CardHeader className="p-4 pb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-700 pb-2 text-xl font-bold focus:outline-none focus:border-purple-500"
                    placeholder="Note Title"
                  />
                ) : (
                  <CardTitle>{title}</CardTitle>
                )}
                <p className="text-xs text-gray-400">{format(new Date(activeNote.date), "MMMM d, yyyy - h:mm a")}</p>
              </CardHeader>
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px] bg-gray-800 border-gray-700 focus:border-purple-500"
                      placeholder="Write your thoughts here..."
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveNote}>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{content}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => setIsEditing(true)}>Edit Note</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center bg-gray-900 rounded-lg p-6">
              <p className="text-gray-400 mb-4">Select a note to view or edit it</p>
              <Button onClick={createNewNote}>
                <Plus className="mr-2 h-4 w-4" /> Create New Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
