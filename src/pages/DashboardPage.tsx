import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Package,
  Ticket,
  Bell,
  User2,
  Plus,
  CalendarPlus,
  FileText,
  Home,
  Clock,
  CheckCircle2,
  DollarSign,
  MessageCircle,
  RotateCcw,
  ClipboardList,
} from 'lucide-react'
import { cn } from '../lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Calendar } from "../components/ui/calendar"
import InventoryPage from './InventoryPage'
import ClientsPage from './ClientsPage'
import TicketsPage from './TicketsPage'
import CloseDealPage from './CloseDealPage'
import DocumentsPage from './DocumentsPage'
import TeamChat from './TeamChat'
import PaymentPage from './PaymentPage'
import RefundPage from './RefundPage'
import SOAPage from './SOA'
import { supabase } from '../lib/supabase'

type MenuItemType = 'dashboard' | 'inventory' | 'clients' | 'tickets' | 'documents' | 'close_deal' | 'team_chat' | 'payment' | 'refund' | 'soa'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
  variant?: 'default' | 'danger' | 'disabled'
}

interface StatType {
  title: string
  value: string
  icon: React.ReactNode
  bgColor: string
}

interface SubdivisionProgressType {
  name: string
  sold: number
  total: number
  color: string
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
        variant === 'disabled' && "opacity-50 pointer-events-none",
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

export function DashboardPage() {
  const navigate = useNavigate()
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType>('dashboard')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [date, setDate] = useState<Date>()
  const [stats, setStats] = useState<StatType[]>([
    {
      title: "Total Lots",
      value: "0",
      icon: <LayoutDashboard className="w-4 h-4 text-white" />,
      bgColor: "bg-blue-500"
    },
    {
      title: "Available Lots",
      value: "0",
      icon: <Home className="w-4 h-4 text-white" />,
      bgColor: "bg-green-500"
    },
    {
      title: "Reserved Lots",
      value: "0",
      icon: <FileText className="w-4 h-4 text-white" />,
      bgColor: "bg-purple-500"
    },
    {
      title: "Sold Lots",
      value: "0",
      icon: <DollarSign className="w-4 h-4 text-white" />,
      bgColor: "bg-orange-500"
    }
  ])

  const [subdivisionProgress, setSubdivisionProgress] = useState<SubdivisionProgressType[]>([
    {
      name: "Living Water Subdivision",
      sold: 0,
      total: 0,
      color: "#3B82F6" // blue-500
    },
    {
      name: "Havahills Estate",
      sold: 0,
      total: 0,
      color: "#10B981" // emerald-500
    }
  ])

  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
  }, []);

  const isMenuItemAllowed = (menuItem: MenuItemType) => {
    if (userRole === 'admin') return true;
    if (userRole === 'limited') {
      return ['documents', 'tickets', 'team_chat'].includes(menuItem);
    }
    return true; // default case
  };

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Living Water Subdivision data
        const { data: livingWaterData, error: livingWaterError } = await supabase
          .from('Living Water Subdivision')
          .select('*')

        // Fetch Havahills Estate data
        const { data: havahillsData, error: havahillsError } = await supabase
          .from('Havahills Estate')
          .select('*')

        if (livingWaterError) throw livingWaterError
        if (havahillsError) throw havahillsError

        const livingWaterLots = livingWaterData || []
        const havahillsLots = havahillsData || []
        const allLots = [...livingWaterLots, ...havahillsLots]
        
        // Calculate stats
        const totalLots = allLots.length
        const availableLots = allLots.filter(lot => lot.Status === 'Available').length
        const reservedLots = allLots.filter(lot => lot.Status === 'Reserved').length
        const soldLots = allLots.filter(lot => lot.Status === 'Sold').length

        // Update stats
        setStats([
          {
            title: "Total Lots",
            value: totalLots.toString(),
            icon: <LayoutDashboard className="w-4 h-4 text-white" />,
            bgColor: "bg-blue-500"
          },
          {
            title: "Available Lots",
            value: availableLots.toString(),
            icon: <Home className="w-4 h-4 text-white" />,
            bgColor: "bg-green-500"
          },
          {
            title: "Reserved Lots",
            value: reservedLots.toString(),
            icon: <FileText className="w-4 h-4 text-white" />,
            bgColor: "bg-purple-500"
          },
          {
            title: "Sold Lots",
            value: soldLots.toString(),
            icon: <DollarSign className="w-4 h-4 text-white" />,
            bgColor: "bg-orange-500"
          }
        ])

        // Update subdivision progress
        setSubdivisionProgress([
          {
            name: "Living Water Subdivision",
            sold: livingWaterLots.filter(lot => lot.Status === 'Sold').length,
            total: livingWaterLots.length,
            color: "#3B82F6"
          },
          {
            name: "Havahills Estate",
            sold: havahillsLots.filter(lot => lot.Status === 'Sold').length,
            total: havahillsLots.length,
            color: "#10B981"
          }
        ])

      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    // Fetch initial data
    fetchStats()

    // Set up real-time subscription for Living Water Subdivision
    const livingWaterSubscription = supabase
      .channel('living-water-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Living Water Subdivision' },
        () => fetchStats()
      )
      .subscribe()

    // Set up real-time subscription for Havahills Estate
    const havahillsSubscription = supabase
      .channel('havahills-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'Havahills Estate' },
        () => fetchStats()
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      livingWaterSubscription.unsubscribe()
      havahillsSubscription.unsubscribe()
    }
  }, [])

  const handleLogoutConfirm = () => {
    localStorage.removeItem('isAuthenticated')
    setShowLogoutDialog(false)
    navigate('/')
  }

  const handleMenuClick = (menuItem: MenuItemType) => {
    setSelectedMenuItem(menuItem)
  }

  const [recentActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      // const { data, error } = await supabase
      //   .from('activities')
      //   .select('*')
      //   .order('created_at', { ascending: false })
      //   .limit(5)
      // if (data) setRecentActivities(data)
    }

    fetchActivities()
  }, [])

  const renderContent = () => {
    if (!isMenuItemAllowed(selectedMenuItem)) {
      return <div className="p-4">You don't have access to this page.</div>;
    }

    switch (selectedMenuItem) {
      case 'dashboard':
        return (
          <>
            {/* Welcome Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back, John</h1>
                <p className="text-sm text-gray-600 mt-1">Here's what's happening with your properties today.</p>
              </div>
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-11rem)]">
              {/* Left Column */}
              <div className="lg:col-span-8 grid gap-6 auto-rows-min">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "p-2 rounded-lg",
                            stat.bgColor
                          )}>
                            {stat.icon}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                            <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Graphs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
                      <p className="text-xs text-gray-500 mt-1">Perform common tasks quickly</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">Add New Listing</h3>
                            <p className="text-xs text-blue-100">Create property listing</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <CalendarPlus className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">Book Site Visit</h3>
                            <p className="text-xs text-emerald-100">Schedule property viewing</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">Create Contract</h3>
                            <p className="text-xs text-amber-100">Generate new contract</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Bell className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">Send Notice</h3>
                            <p className="text-xs text-cyan-100">Notify clients/tenants</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Progress Bars */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm p-6 h-[350px] overflow-auto"
                  >
                    <div className="mb-6">
                      <h2 className="text-sm font-semibold text-gray-900">Lot Sales Progress</h2>
                      <p className="text-xs text-gray-500 mt-1">Sold lots per subdivision</p>
                    </div>
                    <div className="flex-1 space-y-6">
                      {subdivisionProgress.map((subdivision, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{subdivision.name}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {subdivision.sold}/{subdivision.total}
                            </span>
                          </div>
                          <div className="relative w-full h-3 bg-gray-100 rounded-lg overflow-hidden">
                            {/* Gradient background */}
                            <div 
                              className="absolute inset-0 opacity-20"
                              style={{ 
                                background: `linear-gradient(90deg, ${subdivision.color} 0%, ${subdivision.color} 100%)`,
                              }}
                            />
                            {/* Animated dots background */}
                            <div 
                              className="absolute inset-0"
                              style={{ 
                                backgroundImage: `radial-gradient(circle, ${subdivision.color}20 1px, transparent 1px)`,
                                backgroundSize: '8px 8px',
                              }}
                            />
                            {/* Main progress bar */}
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(subdivision.sold / (subdivision.total || 1)) * 100}%` 
                              }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                              className="relative h-full rounded-lg"
                              style={{ 
                                background: `linear-gradient(90deg, ${subdivision.color}99 0%, ${subdivision.color} 100%)`,
                                boxShadow: `0 0 10px ${subdivision.color}40`
                              }}
                            >
                              {/* Shine effect */}
                              <div 
                                className="absolute inset-0 opacity-50"
                                style={{
                                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                                }}
                              />
                            </motion.div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">Sold Lots</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-medium" 
                                style={{ color: subdivision.color }}>
                                {subdivision.sold}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({Math.round((subdivision.sold / (subdivision.total || 1)) * 100)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Transactions Card */}
                  <div className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 h-[300px] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors duration-200"
                        >
                          View All
                        </motion.button>
                      </div>
                      <div className="flex-1 min-h-0">
                        <div className="space-y-3">
                          {/* Will be replaced with Supabase data */}
                          {/* {recentTransactions.map((transaction, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="bg-green-500 p-2 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">Property Sale</p>
                                  <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-green-600">+$458,000</span>
                            </div>
                          ))} */}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Properties Overview Card */}
                  <div className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-xl shadow-sm p-4 lg:p-3 h-[300px] overflow-auto"
                    >
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-sm font-semibold text-gray-900">Properties Overview</h2>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors duration-200"
                        >
                          View Map
                        </motion.button>
                      </div>
                      <div className="flex-1 min-h-0">
                        <div className="space-y-3">
                          {/* Will be replaced with Supabase data */}
                          {/* {propertiesOverview.map((property, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                  <Home className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">Living Water Subdivision</p>
                                  <p className="text-xs text-gray-500">Block 12 - 15 lots available</p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-blue-600">₱12,000/sqm</span>
                            </div>
                          ))} */}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-4 space-y-6 overflow-y-auto">
                {/* Calendar Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm p-4 lg:p-3 h-[350px]"
                >
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-gray-900">Calendar</h2>
                  </div>
                  <div className="flex-1 flex items-center justify-center h-full">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border scale-90"
                    />
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl shadow-sm p-4 lg:p-3 h-[390px] overflow-auto"
                >
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
                    <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                        )}>
                          {activity.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        );
      case 'documents':
        return <DocumentsPage />;
      case 'close_deal':
        return <CloseDealPage />;
      case 'team_chat':
        return <TeamChat />;
      case 'inventory':
        return <InventoryPage />;
      case 'payment':
        return <PaymentPage />;
      case 'clients':
        return <ClientsPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'refund':
        return <RefundPage />;
      case 'soa':
        return <SOAPage />;
      default:
        return <div className="p-4">Page not found.</div>;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "w-64 bg-[#f9fafb] flex flex-col border-r border-gray-100",
            "transition-all duration-300 ease-in-out"
          )}
        >
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">OmniPortal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 py-4">
            <div className="flex flex-col flex-1 space-y-2">
              <SidebarItem
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                isActive={selectedMenuItem === 'dashboard'}
                onClick={() => handleMenuClick('dashboard')}
                variant={isMenuItemAllowed('dashboard') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<Package className="w-5 h-5" />}
                label="Inventory"
                isActive={selectedMenuItem === 'inventory'}
                onClick={() => handleMenuClick('inventory')}
                variant={isMenuItemAllowed('inventory') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<Users className="w-5 h-5" />}
                label="Clients"
                isActive={selectedMenuItem === 'clients'}
                onClick={() => handleMenuClick('clients')}
                variant={isMenuItemAllowed('clients') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<FileText className="w-5 h-5" />}
                label="Documents"
                isActive={selectedMenuItem === 'documents'}
                onClick={() => handleMenuClick('documents')}
                variant={isMenuItemAllowed('documents') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<ClipboardList className="w-5 h-5" />}
                label="SOA"
                isActive={selectedMenuItem === 'soa'}
                onClick={() => handleMenuClick('soa')}
                variant={isMenuItemAllowed('soa') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<DollarSign className="w-5 h-5" />}
                label="Payment"
                isActive={selectedMenuItem === 'payment'}
                onClick={() => handleMenuClick('payment')}
                variant={isMenuItemAllowed('payment') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<RotateCcw className="w-5 h-5" />}
                label="Refund"
                isActive={selectedMenuItem === 'refund'}
                onClick={() => handleMenuClick('refund')}
                variant={isMenuItemAllowed('refund') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<Home className="w-5 h-5" />}
                label="Close Deal"
                isActive={selectedMenuItem === 'close_deal'}
                onClick={() => handleMenuClick('close_deal')}
                variant={isMenuItemAllowed('close_deal') ? 'default' : 'disabled'}
              />
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>

            <div className="flex flex-col space-y-2">
              <SidebarItem
                icon={<Ticket className="w-5 h-5" />}
                label="Tickets"
                isActive={selectedMenuItem === 'tickets'}
                onClick={() => handleMenuClick('tickets')}
                variant={isMenuItemAllowed('tickets') ? 'default' : 'disabled'}
              />
              <SidebarItem
                icon={<MessageCircle className="w-5 h-5" />}
                label="Team Chat"
                isActive={selectedMenuItem === 'team_chat'}
                onClick={() => handleMenuClick('team_chat')}
                variant={isMenuItemAllowed('team_chat') ? 'default' : 'disabled'}
              />
            </div>
          </nav>

          {/* Bottom Items */}
          <div className="pt-4 mt-4 space-y-1 pb-8">
            <motion.div whileHover={{ scale: 1.01 }}>
              <SidebarItem
                icon={<LogOut className="w-5 h-5" />}
                label="Logout"
                variant="danger"
                onClick={() => setShowLogoutDialog(true)}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white flex items-center justify-between px-6">
            <div>
              {/* Left side empty for now */}
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Bell className="w-5 h-5" />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </motion.div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden bg-gray-50">
            <div className="h-full p-6 lg:p-4">
              <div className="h-full flex flex-col max-h-[calc(100vh-7rem)]">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
