"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface WelcomeScreenProps {
  onComplete: () => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleContinue = () => {
    setIsAnimating(true)
    setTimeout(onComplete, 500)
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="space-y-8 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl font-bold leading-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="block text-gray-400">An insanely simple</span>
          <span className="bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
            Habit Tracker
          </span>
          <span className="block text-gray-400">to track your habits</span>
        </motion.h1>

        <motion.div
          className="mt-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div className="relative w-64 h-64 mx-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <img
              src="/images/writing-cartoon.png"
              alt="Person writing creatively"
              className="w-full h-full object-contain rounded-xl"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            onClick={handleContinue}
            className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 text-black"
            disabled={isAnimating}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
