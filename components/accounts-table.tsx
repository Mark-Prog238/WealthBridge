"use client"

import { useState } from "react"
import { IbkrConnectDialog } from "@/components/ibkr-connect-dialog" // Adjust path if needed
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  LandmarkIcon,
  WalletIcon,
  LineChartIcon,
  PlusCircleIcon,
  ArrowUpRightIcon,
} from "lucide-react"

export default function AccountsPage() {
  // 1. State for the dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 2. Mock data to visualize the layout (you will replace this with your database fetch later)
  const mockAccounts = [
    {
      id: 1,
      type: "bank",
      name: "NLB d.d.",
      desc: "Varčevalni račun",
      balance: "12,500.00 EUR",
      status: "Synced",
      icon: LandmarkIcon,
    },
    {
      id: 2,
      type: "ibkr",
      name: "Interactive Brokers",
      desc: "Margin Account",
      balance: "45,231.00 EUR",
      status: "Synced",
      icon: LineChartIcon,
    },
    {
      id: 3,
      type: "crypto",
      name: "Main Wallet",
      desc: "ETH Chain",
      balance: "4.250000 ETH",
      status: "Pending",
      icon: WalletIcon,
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-muted-foreground">
            Manage your connected wallets and brokerages.
          </p>
        </div>

        {/* Trigger for your custom Dialog */}
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* SUMMARY CARDS (Top Row) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Net Worth
            </CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">67,420.50 EUR</div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              <ArrowUpRightIcon className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="font-medium text-emerald-500">+2.5%</span> from
              last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Brokerage & Fiat
            </CardTitle>
            <LandmarkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">57,731.00 EUR</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On-Chain Crypto
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">4.250000 ETH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Connections
            </CardTitle>
            <PlusCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">3</div>
          </CardContent>
        </Card>
      </div>

      {/* ACCOUNT LIST (Segmented by Tabs) */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="ibkr">Brokerage</TabsTrigger>
          <TabsTrigger value="bank">Banking</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockAccounts.map((account) => (
            // HORIZONTAL ROW CARD
            <Card
              key={account.id}
              className="flex flex-row items-center justify-between p-4"
            >
              {/* Left Side: Icon & Details */}
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <account.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{account.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {account.desc}
                  </span>
                </div>
              </div>

              {/* Right Side: Balance & Status */}
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold tabular-nums">
                  {account.balance}
                </span>
                <Badge
                  variant={
                    account.status === "Synced" ? "default" : "secondary"
                  }
                >
                  {account.status}
                </Badge>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* You would create identical TabsContent blocks for "ibkr", "bank", and "crypto" filtering the array */}
      </Tabs>

      {/* The Dialog rests at the bottom, invisible until the button is clicked */}
      <IbkrConnectDialog open={isDialogOpen} setOpen={setIsDialogOpen} />
    </div>
  )
}
