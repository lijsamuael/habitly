"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, BookOpen, PenTool, User } from "lucide-react"

export function NavigationBar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Habits", icon: <Heart className="w-6 h-6" /> },
    { href: "/notes", label: "Notes", icon: <BookOpen className="w-6 h-6" /> },
    { href: "/widgets", label: "Sketches", icon: <PenTool className="w-6 h-6" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-6 h-6" /> },
  ]

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 py-2 px-4 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center">
              <motion.div
                className={`p-2 rounded-full ${isActive ? "text-purple-500" : "text-gray-400"}`}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </motion.div>
              <span className={`text-xs ${isActive ? "text-purple-500" : "text-gray-400"}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
