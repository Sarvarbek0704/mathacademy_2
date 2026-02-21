"use client"

import { Provider } from "react-redux"
import { ThemeProvider } from "next-themes"
import { store } from "@/lib/store"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-card text-card-foreground border-border",
              title: "text-foreground",
              description: "text-muted-foreground",
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  )
}
