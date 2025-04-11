"use client"
import { NavigationBar } from "@/components/navigation-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SketchCanvas } from "@/components/sketch-canvas"

export default function SketchesPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sketches</h1>

        <Card className="bg-gray-900 mb-6">
          <CardHeader className="pb-0">
            <CardTitle>Sketch Your Ideas</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="min-h-[450px]">
              <SketchCanvas />
            </div>
          </CardContent>
        </Card>
      </div>
      <NavigationBar />
    </div>
  )
}
