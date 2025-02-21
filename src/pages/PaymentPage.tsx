import { useState, useEffect } from 'react'
import { Search, Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '../lib/supabase'
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Payment {
  id: number
  Client: string
  Amount: number
  "Payment Date": string
  "Payment Type": string
  "Monthly Amortization": string
  "Penalty Amount": number
  Status: string
}

interface Client {
  id: number
  Name: string
}

interface PaymentForm {
  Client: string
  Amount: string
  "Payment Type": string
  "Payment Date": string
  Status: string
  "Monthly Amortization": string
  "Penalty Amount": string
}

export default function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    Client: '',
    Amount: '',
    "Payment Type": '',
    "Payment Date": new Date().toISOString().split('T')[0],
    Status: 'Pending',
    "Monthly Amortization": '',
    "Penalty Amount": ''
  })
  const { toast } = useToast()

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  useEffect(() => {
    fetchPayments()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      console.log('Fetching clients...')
      const { data, error } = await supabase
        .from('Clients')
        .select('id, Name')
        .order('Name')

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Clients data:', data)
      if (data) setClients(data)
    } catch (error: any) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments...')
      const { data, error } = await supabase
        .from('Payments')
        .select(`
          id,
          created_at,
          Client,
          Amount,
          "Payment Type",
          "Monthly Amortization",
          "Penalty Amount",
          "Payment Date",
          Status
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Payments data:', data)

      if (data) {
        setPayments(data)
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!paymentForm.Client || !paymentForm.Amount || !paymentForm["Payment Type"] || !paymentForm["Monthly Amortization"]) {
        throw new Error('Please fill in all required fields')
      }

      // Log the data being sent
      console.log('Submitting payment data:', {
        Client: paymentForm.Client,
        Amount: parseFloat(paymentForm.Amount),
        "Payment Type": paymentForm["Payment Type"],
        "Monthly Amortization": paymentForm["Monthly Amortization"],
        "Penalty Amount": paymentForm["Penalty Amount"] ? parseFloat(paymentForm["Penalty Amount"]) : 0,
        "Payment Date": paymentForm["Payment Date"],
        Status: paymentForm.Status
      })

      const { data, error } = await supabase
        .from('Payments')
        .insert([
          {
            Client: paymentForm.Client,
            Amount: parseFloat(paymentForm.Amount),
            "Payment Type": paymentForm["Payment Type"],
            "Monthly Amortization": paymentForm["Monthly Amortization"],
            "Penalty Amount": paymentForm["Penalty Amount"] ? parseFloat(paymentForm["Penalty Amount"]) : 0,
            "Payment Date": paymentForm["Payment Date"],
            Status: paymentForm.Status
          }
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Payment saved successfully:', data)

      toast({
        title: "Success",
        description: "Payment recorded successfully",
        variant: "default",
        className: "bg-green-50"
      })

      // Reset form to initial state
      setPaymentForm({
        Client: '',
        Amount: '',
        "Payment Type": '',
        "Payment Date": new Date().toISOString().split('T')[0],
        Status: 'Pending',
        "Monthly Amortization": '',
        "Penalty Amount": ''
      })
      setShowPaymentModal(false)
      // Refresh the payments list
      fetchPayments()
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track all client payments</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center space-x-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search payments..." className="pl-9 w-full" />
        </div>
        <Button onClick={() => setShowPaymentModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Penalty Amount</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Monthly Amortization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.Client}</TableCell>
                  <TableCell className="text-right font-medium">₱{payment.Amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">₱{payment["Penalty Amount"] ? payment["Penalty Amount"].toLocaleString() : '0.00'}</TableCell>
                  <TableCell>{format(new Date(payment["Payment Date"]), "MMMM d, yyyy")}</TableCell>
                  <TableCell>{payment["Payment Type"]}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        payment.Status === "Completed"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : payment.Status === "Failed"
                          ? "bg-red-50 text-red-700 ring-red-600/20"
                          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                      )}
                    >
                      {payment.Status}
                    </span>
                  </TableCell>
                  <TableCell>{payment["Monthly Amortization"]}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="w-4 h-4" />
              </div>
              New Payment
            </DialogTitle>
            <DialogDescription>
              Record a new payment from a client
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-medium">Client</Label>
                <Select
                  value={paymentForm.Client}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, Client: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.Name}>
                        {client.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    value={paymentForm.Amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setPaymentForm({ ...paymentForm, Amount: value });
                      }
                    }}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Payment Type */}
              <div className="space-y-2">
                <Label htmlFor="payment_type" className="text-sm font-medium">Payment Type</Label>
                <Select
                  value={paymentForm["Payment Type"]}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, "Payment Type": value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amortization */}
              <div className="space-y-2">
                <Label htmlFor="amortization" className="text-sm font-medium">Monthly Amortization</Label>
                <Select
                  value={paymentForm["Monthly Amortization"]}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, "Monthly Amortization": value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select monthly payment" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={`${num}${getOrdinalSuffix(num)} Monthly`}>
                        {num}{getOrdinalSuffix(num)} Monthly Amortization
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Penalty */}
              <div className="space-y-2">
                <Label htmlFor="penalty" className="text-sm font-medium">Penalty Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    id="penalty"
                    type="number"
                    step="0.01"
                    value={paymentForm["Penalty Amount"]}
                    onChange={(e) => setPaymentForm({ ...paymentForm, "Penalty Amount": e.target.value })}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="payment_date" className="text-sm font-medium">Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentForm["Payment Date"] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentForm["Payment Date"] ? (
                        format(new Date(paymentForm["Payment Date"]), "MMMM d, yyyy")
                      ) : (
                        <span>Select payment date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentForm["Payment Date"] ? new Date(paymentForm["Payment Date"]) : undefined}
                      onSelect={(date) => 
                        setPaymentForm({ 
                          ...paymentForm, 
                          "Payment Date": date ? format(date, "yyyy-MM-dd") : "" 
                        })
                      }
                      className="rounded-md border shadow-md bg-white"
                      disabled={(date) => date > new Date()}
                      fromDate={new Date("2017-01-01")}
                      toDate={new Date("2035-12-31")}
                      showOutsideDays={false}
                      classNames={{
                        months: "space-y-4",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        ),
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: cn(
                          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        ),
                        day: cn(
                          "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                          "hover:bg-accent hover:text-accent-foreground"
                        ),
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle:
                          "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={paymentForm.Status}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, Status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Completed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="Failed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Failed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)}
                className="gap-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
