"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Habit } from "@/lib/types";
import { useHabits } from "@/contexts/habit-context";
import { WelcomeScreen } from "@/components/welcome-screen";
import { HabitCard } from "@/components/habit-card";
import { HabitGrid } from "@/components/habit-grid";
import { HabitDetails } from "@/components/habit-details";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { NavigationBar } from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const { habits, viewMode, toggleViewMode } = useHabits();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("habitly_visited");
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    localStorage.setItem("habitly_visited", "true");
  };

  const handleViewHabitDetails = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  const handleBackFromDetails = () => {
    setSelectedHabit(null);
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {selectedHabit ? (
        <HabitDetails habit={selectedHabit} onBack={handleBackFromDetails} />
      ) : (
        <>
          <div className="p-4 max-w-4xl s mx-auto">
            <div className="flex justify-center mb-4">
              <div className="inline-flex bg-gray-800 rounded-full p-1">
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  className={`rounded-full ${
                    viewMode === "week" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => toggleViewMode()}
                >
                  Week View
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className={`rounded-full ${
                    viewMode === "grid" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => toggleViewMode()}
                >
                  Grid View
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, x: viewMode === "week" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewMode === "week" ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {habits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-60 text-center">
                    <p className="text-gray-400 mb-4">
                      No habits yet. Add your first habit to get started!
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      Add Habit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {habits.map((habit) =>
                      viewMode === "week" ? (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          onViewDetails={() => handleViewHabitDetails(habit)}
                        />
                      ) : (
                        <HabitGrid
                          key={habit.id}
                          habit={habit}
                          onViewDetails={() => handleViewHabitDetails(habit)}
                        />
                      )
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="fixed bottom-20 right-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => setShowAddDialog(true)}
              className="h-14 w-14 rounded-full bg-white text-black hover:bg-gray-200"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>

          <NavigationBar />

          <AddHabitDialog
            isOpen={showAddDialog}
            onClose={() => setShowAddDialog(false)}
          />
        </>
      )}
    </div>
  );
}
