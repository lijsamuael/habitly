"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ServiceWorkerRegistration() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
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
      console.log("PWA was installed")
    })

    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // New content is available, show a notification or refresh
                    if (confirm("New version available! Reload to update?")) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )

        // Handle controller change (when a new service worker takes over)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("New service worker controller")
        })
      })
    }
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

  return (
    <>
      {isInstallable && !isInstalled && (
        <div className="fixed top-0 left-0 right-0 bg-purple-900 text-white p-2 flex items-center justify-between z-50">
          <span className="text-sm">Install Habitly for offline use</span>
          <Button
            size="sm"
            variant="outline"
            className="text-white border-white hover:bg-purple-800"
            onClick={handleInstallClick}
          >
            <Download className="h-4 w-4 mr-1" /> Install
          </Button>
        </div>
      )}
    </>
  )
}
