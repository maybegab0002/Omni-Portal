import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Download, Printer, FileText, Home, Calendar } from "lucide-react"
import { format } from 'date-fns'

interface ClientSOA {
  id: string;
  name: string;
  property: {
    project: string;
    block: string;
    lot: string;
  };
  totalContractPrice: number;
  monthlyAmortization: number;
  dueDate: string;
  balance: number;
}

export default function SOA() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showViewSOAModal, setShowViewSOAModal] = useState(false)
  const [showCreateSOAModal, setShowCreateSOAModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientSOA | null>(null)

  // Dummy data - replace with actual data from your database
  const clients: ClientSOA[] = [
    {
      id: '1',
      name: 'John Doe',
      property: {
        project: 'Living Water Subdivision',
        block: 'A',
        lot: '1',
      },
      totalContractPrice: 2500000,
      monthlyAmortization: 15000,
      dueDate: '2024-03-15',
      balance: 2250000,
    },
    // Add more dummy data as needed
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const handleViewSOA = (client: ClientSOA) => {
    setSelectedClient(client)
    setShowViewSOAModal(true)
  }

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.property.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Statement of Account</h1>
          <p className="text-sm text-gray-600 mt-1">View and generate statements of account for clients</p>
        </div>
        <div className="flex gap-3">
          <Button variant="default" size="sm" onClick={() => setShowCreateSOAModal(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Create SOA
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by client name or property..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="space-y-4">
              {/* Client Name */}
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{client.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSOA(client)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View SOA
                </Button>
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="w-4 h-4" />
                <span>{client.property.project}</span>
              </div>
              <div className="text-sm text-gray-600 pl-6">
                Block {client.property.block}, Lot {client.property.lot}
              </div>

              {/* Financial Details */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(client.monthlyAmortization)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(client.balance)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {format(new Date(client.dueDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create SOA Modal */}
      <Dialog open={showCreateSOAModal} onOpenChange={setShowCreateSOAModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Statement of Account</DialogTitle>
            <DialogDescription>
              Generate a statement of account for a client
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="client" className="text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <Input
                  id="client"
                  placeholder="Select client"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="project" className="text-sm font-medium text-gray-700">
                  Project
                </label>
                <Input
                  id="project"
                  placeholder="Project name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="block" className="text-sm font-medium text-gray-700">
                  Block
                </label>
                <Input
                  id="block"
                  placeholder="Block number"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lot" className="text-sm font-medium text-gray-700">
                  Lot
                </label>
                <Input
                  id="lot"
                  placeholder="Lot number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="totalPrice" className="text-sm font-medium text-gray-700">
                  Total Contract Price
                </label>
                <Input
                  id="totalPrice"
                  type="number"
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="monthlyPayment" className="text-sm font-medium text-gray-700">
                  Monthly Amortization
                </label>
                <Input
                  id="monthlyPayment"
                  type="number"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateSOAModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Add your SOA creation logic here
                setShowCreateSOAModal(false)
              }}>
                Generate SOA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View SOA Modal */}
      <Dialog open={showViewSOAModal} onOpenChange={setShowViewSOAModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Statement of Account</DialogTitle>
            <DialogDescription>
              Detailed statement for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Client and Property Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Client Information</h4>
                  <p className="text-sm text-gray-600">{selectedClient.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Property Details</h4>
                  <p className="text-sm text-gray-600">
                    {selectedClient.property.project}<br />
                    Block {selectedClient.property.block}, Lot {selectedClient.property.lot}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Total Contract Price</div>
                    <div className="text-lg font-medium text-blue-900 mt-1">
                      {formatCurrency(selectedClient.totalContractPrice)}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Current Balance</div>
                    <div className="text-lg font-medium text-green-900 mt-1">
                      {formatCurrency(selectedClient.balance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Payment Details</h4>
                <div className="bg-white rounded-lg border">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <div className="text-sm text-gray-600">Monthly Amortization</div>
                      <div className="text-base font-medium text-gray-900 mt-1">
                        {formatCurrency(selectedClient.monthlyAmortization)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Next Due Date</div>
                      <div className="text-base font-medium text-gray-900 mt-1">
                        {format(new Date(selectedClient.dueDate), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowViewSOAModal(false)}>
                  Close
                </Button>
                <Button>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Statement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
