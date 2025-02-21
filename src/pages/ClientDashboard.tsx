import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion"
import { Home, DollarSign, FileText, TicketIcon, Settings, LogOut, Bell, User2, Menu, X, MessageCircle, HelpCircle, Phone, Search, MapPin } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { cn } from "../lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

// Sample data for the client's properties
const properties = [
  {
    id: "LW-101",
    project: "Living Water Subdivision",
    block: "Block 1",
    lot: "Lot 1",
    area: "150 sqm",
    type: "Residential",
    phase: "Phase 1",
    status: "Owned",
    monthlyDue: "₱25,000",
    acquisitionDate: "2023-08-15"
  },
  {
    id: "LW-102",
    project: "Living Water Subdivision",
    block: "Block 1",
    lot: "Lot 2",
    area: "150 sqm",
    type: "Residential",
    phase: "Phase 1",
    status: "Owned",
    monthlyDue: "₱25,000",
    acquisitionDate: "2023-08-15"
  },
  {
    id: "HE-201",
    project: "Havahills Estate",
    block: "Block 2",
    lot: "Lot 1",
    area: "200 sqm",
    type: "Commercial",
    phase: "Business District",
    status: "Owned",
    monthlyDue: "₱35,000",
    acquisitionDate: "2023-10-01"
  }
]

// Sample data for support tickets
const tickets = [
  {
    id: "TKT001",
    title: "Document Request",
    status: "in_progress",
    priority: "medium",
    createdAt: "2025-02-01"
  },
  {
    id: "TKT002",
    title: "Payment Inquiry",
    status: "resolved",
    priority: "low",
    createdAt: "2025-01-28"
  }
]

type MenuItemType = 'dashboard' | 'properties' | 'payments' | 'support' | 'settings'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
  variant?: 'default' | 'danger'
}

function SidebarItem({ icon, label, isActive, onClick, variant = 'default' }: SidebarItemProps) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-4 px-4 py-3 cursor-pointer rounded-lg mx-2 transition-all duration-300",
        variant === 'default' && "hover:bg-gray-100/50",
        variant === 'danger' && "hover:bg-red-50 group",
        isActive && "bg-white shadow-lg shadow-gray-200/50",
        variant === 'danger' && "text-gray-600 hover:text-red-600"
      )}
    >
      <motion.div 
        className={cn(
          "bg-white rounded-xl p-2.5 flex items-center justify-center transition-all duration-300 shadow-sm",
          variant === 'danger' && "group-hover:text-red-600",
          isActive && "bg-blue-600 text-white shadow-md shadow-blue-200/50"
        )}
        whileHover={{ rotate: variant === 'danger' ? -10 : 0 }}
      >
        {icon}
      </motion.div>
      <span className={cn(
        "font-medium transition-all duration-300",
        isActive && "text-blue-600 font-semibold"
      )}>{label}</span>
    </motion.div>
  )
}



const getTicketStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge variant="destructive">Open</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "resolved":
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
    default:
      return null
  }
}

export default function ClientDashboard() {
  const navigate = useNavigate()
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  // Support options data
  const supportOptions = [
    {
      title: "Submit a Ticket",
      description: "Create a new support ticket for technical issues or maintenance requests",
      icon: MessageCircle,
      action: () => setSelectedMenuItem('tickets')
    },
    {
      title: "Knowledge Base",
      description: "Browse through our documentation and frequently asked questions",
      icon: FileText,
      action: () => console.log("Knowledge Base clicked")
    },
    {
      title: "FAQ",
      description: "Find quick answers to common questions",
      icon: HelpCircle,
      action: () => console.log("FAQ clicked")
    },
    {
      title: "Contact Support",
      description: "Get in touch with our support team directly",
      icon: Phone,
      action: () => setShowContactForm(true)
    }
  ]

  // Sample payments data
  const payments = [
    {
      id: "PAY001",
      date: "2024-01-15",
      amount: "₱1,500.00",
      property: "Living Water Block 1",
      type: "Rent",
      status: "Paid",
      reference: "REF123456"
    },
    {
      id: "PAY002",
      date: "2024-01-05",
      amount: "₱200.00",
      property: "Living Water Block 1",
      type: "Utilities",
      status: "Paid",
      reference: "REF123457"
    },
    {
      id: "PAY003",
      date: "2023-12-15",
      amount: "₱1,500.00",
      property: "Living Water Block 1",
      type: "Rent",
      status: "Paid",
      reference: "REF123458"
    },
    {
      id: "PAY004",
      date: "2023-12-05",
      amount: "₱180.00",
      property: "Living Water Block 1",
      type: "Utilities",
      status: "Paid",
      reference: "REF123459"
    }
  ]


  // Handle authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const userRole = localStorage.getItem('userRole')
    
    if (!isAuthenticated || userRole !== 'client') {
      navigate('/')
    }
  }, [navigate])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024
      setIsLargeScreen(isLarge)
      if (isLarge) {
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    localStorage.removeItem('isAuthenticated')
    setShowLogoutDialog(false)
    navigate('/')
  }

  const menuItems = [
    {
      id: 'dashboard' as MenuItemType,
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard'
    },
    {
      id: 'properties' as MenuItemType,
      icon: <FileText className="w-5 h-5" />,
      label: 'My Properties'
    },
    {
      id: 'payments' as MenuItemType,
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Payments'
    },
    {
      id: 'support' as MenuItemType,
      icon: <TicketIcon className="w-5 h-5" />,
      label: 'Support'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && !isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black lg:hidden z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={cn(
              "fixed lg:relative w-64 h-screen bg-white border-r border-gray-200 py-3 flex flex-col justify-between z-30",
              !isLargeScreen && "shadow-xl"
            )}
          >
            <div className="space-y-1">
              {/* Logo and Close Button */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">OmniPortal</h1>
                  <p className="text-xs text-gray-500">Client Portal</p>
                </div>
                {!isLargeScreen && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Menu Items */}
              <div className="px-3">
                {menuItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={selectedMenuItem === item.id}
                    onClick={() => {
                      setSelectedMenuItem(item.id);
                      if (!isLargeScreen) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-1">
              <SidebarItem
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
                onClick={() => {
                  setSelectedMenuItem('settings')
                  if (!isLargeScreen) {
                    setIsSidebarOpen(false)
                  }
                }}
                isActive={selectedMenuItem === 'settings'}
              />
              <SidebarItem
                icon={<LogOut className="w-5 h-5" />}
                label="Logout"
                variant="danger"
                onClick={handleLogoutClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {(!isLargeScreen || !isSidebarOpen) && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {menuItems.find(item => item.id === selectedMenuItem)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                2
              </span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                <User2 className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">John Doe</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* Payments Content */}
          {selectedMenuItem === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="flex-1 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
                  <p className="text-muted-foreground">
                    View and manage your payment transactions
                  </p>
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1 flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search payments..." className="pl-8" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payments Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{payment.reference}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.property}</TableCell>
                        <TableCell>{payment.type}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "Paid"
                                ? "default"
                                : payment.status === "Pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Support Content */}
          {selectedMenuItem === 'support' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              <h1 className="text-3xl font-bold mb-2">Support Center</h1>
              <p className="text-gray-600 mb-8">
                Welcome to our support center. How can we help you today?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {supportOptions.map((option, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={option.action}
                  >
                    <CardHeader>
                      <option.icon className="w-8 h-8 mb-2 text-primary" />
                      <CardTitle>{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {showContactForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Support</CardTitle>
                      <CardDescription>
                        Fill out the form below and we'll get back to you as soon as possible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Input placeholder="Your Name" />
                        </div>
                        <div>
                          <Input type="email" placeholder="Email Address" />
                        </div>
                        <div>
                          <Input placeholder="Subject" />
                        </div>
                        <div>
                          <Textarea placeholder="Describe your issue or question" rows={4} />
                        </div>
                        <div className="flex gap-4">
                          <Button type="submit">Send Message</Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowContactForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Properties Content */}
          {selectedMenuItem === 'properties' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="flex-1 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">My Properties</h2>
                  <p className="text-muted-foreground">
                    View and manage your property portfolio
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1 flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search properties..." className="pl-8" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="living-water">Living Water Subdivision</SelectItem>
                      <SelectItem value="havahills">Havahills Estate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Properties Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Block & Lot</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Monthly Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{property.id}</TableCell>
                        <TableCell>{property.project}</TableCell>
                        <TableCell>{property.block} {property.lot}</TableCell>
                        <TableCell>{property.area}</TableCell>
                        <TableCell>{property.type}</TableCell>
                        <TableCell>{property.phase}</TableCell>
                        <TableCell>{property.monthlyDue}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              property.status === "Owned"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {property.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Property Details */}
              <div className="grid gap-4 md:grid-cols-2">
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{property.project}</h3>
                        <p className="text-sm text-muted-foreground">{property.block} {property.lot}</p>
                      </div>
                      <Badge
                        variant={
                          property.status === "Owned"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{property.phase}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{property.area} • {property.type}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Monthly Due: {property.monthlyDue}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dashboard Content */}
          {selectedMenuItem === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="space-y-4"
            >
              {/* Stats Cards */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">My Properties</p>
                      <p className="text-lg font-bold">2</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Investment</p>
                      <p className="text-lg font-bold">₱3.2M</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Monthly Due</p>
                      <p className="text-lg font-bold">₱25,000</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500 rounded-full">
                      <TicketIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Active Tickets</p>
                      <p className="text-lg font-bold">1</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Properties and Payments Section */}
              <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <h3 className="text-sm font-semibold mb-3">My Properties</h3>
                  <div className="space-y-2">
                    {properties.map((property) => (
                      <motion.div
                        key={property.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100"
                      >
                        <div>
                          <h4 className="text-sm font-medium">{property.project}</h4>
                          <p className="text-xs text-gray-500">{property.block} {property.lot}</p>
                        </div>
                        <Badge
                          variant={
                            property.status === "Owned"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {property.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <h3 className="text-sm font-semibold mb-3">Recent Payments</h3>
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <motion.div
                        key={payment.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100"
                      >
                        <div>
                          <h4 className="text-sm font-medium">{payment.type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.date).toLocaleDateString()} • {payment.property}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">{payment.amount}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Support Tickets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
              >
                <h3 className="text-sm font-semibold mb-3">Support Tickets</h3>
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100"
                    >
                      <div>
                        <h4 className="text-sm font-medium">{ticket.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getTicketStatusBadge(ticket.status)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
