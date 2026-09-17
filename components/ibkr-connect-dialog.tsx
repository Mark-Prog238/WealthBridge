"use client"

import { useTransition, useState } from "react"
import { insertSecret } from "@/app/utils/actions"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { M_PLUS_1 } from "next/font/google"

const items = [
  {
    label: "Bank",
    type: "bank",
  },
  {
    label: "Interactive Brokers",
    type: "ibkr",
  },
  {
    label: "ETH chain",
    type: "blockchain",
  },
  {
    label: "SOL chain",
    type: "blockchain",
  },
  {
    label: "BTC chain",
    type: "blockchain",
  },
]

export function IbkrConnectDialog({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedValue, setSelectedValue] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const selectedItem = items.find((item) => item.label === selectedValue)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg(null)

    const formData = new FormData(event.currentTarget)
    const queryId = formData.get("queryId") as string
    const token = formData.get("token") as string

    if (!queryId || !token) {
      setErrorMsg("Both Query ID and Token are required.")
      return
    }

    startTransition(async () => {
      const result = await insertSecret(token, "queryType", queryId)
      if (result.success) {
        setOpen(false) // Use the parent's function to close it
      } else {
        setErrorMsg(result.error || "Failed to save credentials.")
      }
    })
  }

  return (
    // 2. The Dialog listens to the parent's variables
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect a new account</DialogTitle>
          <DialogDescription>
            Select the type of your new account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded bg-destructive/10 p-2 text-sm font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          {/* toogle what to add  */}
          <div className="space-y-2">
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger className="w-full max-w-48">
                {/* The placeholder replaces your null item */}
                <SelectValue placeholder="Select type of account" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Account Types</SelectLabel>
                  {items.map((item) => (
                    <SelectItem key={item.label} value={item.label}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {selectedItem?.type == "blockchain" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wallet_address">Wallet Address</Label>
                  <Input
                    id="wallet_address"
                    type="password"
                    name="wallet_address"
                    placeholder="sk-..."
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet_title">Wallet Title</Label>
                  <Input
                    id="wallet_title"
                    type="text"
                    name="wallet_address"
                    placeholder="Wallet 1"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet_description">Wallet Description</Label>
                  <Input
                    id="wallet_description"
                    type="text"
                    name="wallet_description"
                    placeholder="My main crypto wallet"
                    disabled={isPending}
                  />
                </div>
              </>
            ) : /* IF IBKR */
            selectedItem?.type == "ibkr" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="query_id">Flex Query ID</Label>
                  <Input
                    id="query_id"
                    type="text"
                    name="query_id"
                    placeholder="128193282"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ibkr_query_secret">Flex Query ID</Label>
                  <Input
                    id="ibkr_query_secret"
                    type="password"
                    name="ibkr_query_secret"
                    placeholder="***************"
                    disabled={isPending}
                  />
                </div>
              </>
            ) : selectedItem?.type == "bank" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cash">Bank Account Name</Label>
                  <Input
                    id="bank_name"
                    type="text"
                    name="bank_name"
                    placeholder="NLB d.d."
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ibkr_query_secret">
                    Bank Account Description
                  </Label>
                  <Input
                    id="bank_desc"
                    type="text"
                    name="bank_desc"
                    placeholder="Varčevalni račun"
                    disabled={isPending}
                  />
                </div>
              </>
            ) : (
              <p className="pt-2 text-sm text-muted-foreground">
                Please select an account type to continue.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Encrypt
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
