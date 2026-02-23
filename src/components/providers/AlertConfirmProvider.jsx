"use client"
import { createContext, useContext, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const ConfirmContext = createContext()

export function useConfirm() {
  return useContext(ConfirmContext)
}

export function AlertConfirmProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState("confirm") // confirm | alert
  const [resolver, setResolver] = useState(null)
  const [autoClose, setAutoClose] = useState(null)

  const confirm = (msg) => {
    setMessage(msg)
    setMode("confirm")
    setOpen(true)

    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }

  const alert = (msg, options = {}) => {
    setMessage(msg)
    setMode("alert")
    setOpen(true)
    setAutoClose(options.autoClose ?? 5000)

    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }

  const handleClose = (result = true) => {
    setOpen(false)
    setAutoClose(null)
    resolver?.(result)
    setResolver(null)
  }

  // ⏱ AUTO CLOSE ALERT
  useEffect(() => {
    if (mode === "alert" && autoClose) {
      const timer = setTimeout(() => {
        handleClose(true)
      }, autoClose)

      return () => clearTimeout(timer)
    }
  }, [mode, autoClose])

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      <Dialog open={open} onOpenChange={() => handleClose(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "confirm" ? "Konfirmasi" : "Informasi"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground whitespace-pre-line">{message}</p>

          <DialogFooter>
            {mode === "confirm" && (
              <Button variant="outline" onClick={() => handleClose(false)}>
                Batal
              </Button>
            )}

            {mode === "confirm" && (
              <Button onClick={() => handleClose(true)}>OK</Button>
            )}

            {mode === "alert" && !autoClose && (
              <Button onClick={() => handleClose(true)}>OK</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
