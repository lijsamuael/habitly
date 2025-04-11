"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Smartphone, Laptop, Share, Plus } from "lucide-react"

export function InstallApp() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop" | "unknown">("unknown")

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    if (/android/i.test(userAgent)) {
      setPlatform("android")
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform("ios")
      setIsIOS(true)
    } else if (window.innerWidth > 768) {
      setPlatform("desktop")
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e)
      setIsInstallable(true)
    })

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setIsInstallable(false)
    })
  }, [])

  const handleInstallClick = () => {
    if (!installPrompt) return

    // Show the install prompt
    installPrompt.prompt()

    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
        setIsInstallable(false)
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setInstallPrompt(null)
    })
  }

  if (isInstalled) {
    return (
      <Card className="bg-green-900/20 border-green-800/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" /> App Installed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-400">
            Habitly is installed on your device. You can access it from your home screen or app drawer.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900">
      <CardHeader>
        <CardTitle>Install Habitly App</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-400">
          Install Habitly on your device to access it offline and get a better experience.
        </p>

        {isInstallable && (
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500" onClick={handleInstallClick}>
            <Download className="mr-2 h-5 w-5" /> Install App
          </Button>
        )}

        {isIOS && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">To install on iOS:</p>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <Share className="mr-2 h-5 w-5 text-blue-400 shrink-0" />
                <span>Tap the share button in your browser</span>
              </li>
              <li className="flex items-start">
                <Plus className="mr-2 h-5 w-5 text-blue-400 shrink-0" />
                <span>Scroll down and tap "Add to Home Screen"</span>
              </li>
              <li className="flex items-start">
                <Smartphone className="mr-2 h-5 w-5 text-blue-400 shrink-0" />
                <span>Tap "Add" in the top right corner</span>
              </li>
            </ol>
          </div>
        )}

        {platform === "desktop" && !isInstallable && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">To install on desktop:</p>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <Laptop className="mr-2 h-5 w-5 text-blue-400 shrink-0" />
                <span>Look for the install icon in your browser's address bar</span>
              </li>
              <li className="flex items-start">
                <Plus className="mr-2 h-5 w-5 text-blue-400 shrink-0" />
                <span>Click "Install" when prompted</span>
              </li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
