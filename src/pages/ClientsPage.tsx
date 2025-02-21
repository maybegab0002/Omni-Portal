import { Search, UserPlus, Loader2, ChevronDown, Home, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface Client {
  id: number;
  Name: string;
  Email: string;
  properties: Array<{
    Project: string;
    Block: string;
    Lot: string;
  }>;
}

interface AccountForm {
  email: string;
  password: string;
}

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountForm, setAccountForm] = useState<AccountForm>({
    email: '',
    password: ''
  })
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Fetch clients with their properties
  const fetchClients = async () => {
    setIsLoading(true)
    try {
      // First get all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('Clients')
        .select('*')

      if (clientsError) throw clientsError

      // For each client, check both property tables
      const clientsWithProperties = await Promise.all(
        clientsData.map(async (client) => {
          // Check Living Water Subdivision
          const { data: livingWaterData } = await supabase
            .from('Living Water Subdivision')
            .select('Block, Lot')
            .eq('Owner', client.Name)

          // Check Havahills Estate
          const { data: havahillsData } = await supabase
            .from('Havahills Estate')
            .select('Block, Lot')
            .eq('Owner', client.Name)

          // Combine properties from both projects
          const properties = [
            ...(livingWaterData || []).map(prop => ({
              Project: 'Living Water Subdivision',
              Block: prop.Block,
              Lot: prop.Lot
            })),
            ...(havahillsData || []).map(prop => ({
              Project: 'Havahills Estate',
              Block: prop.Block,
              Lot: prop.Lot
            }))
          ];

          return {
            ...client,
            properties: properties.length > 0 ? properties : [{
              Project: '-',
              Block: '-',
              Lot: '-'
            }]
          }
        })
      )

      setClients(clientsWithProperties)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch clients data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  // Filter clients based on selected project and search query
  const filteredClients = clients.filter(client => {
    const matchesProject = selectedProject === 'all' || client.properties.some(prop => prop.Project === selectedProject);
    const matchesSearch = client.Name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage)
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const handleCreateAccount = async () => {
    if (!selectedClient) return;
    
    setIsCreatingAccount(true)
    try {
      // 1. First check if we can find the client
      const { data: existingClient, error: checkError } = await supabase
        .from('Clients')
        .select('id, Name')
        .eq('id', selectedClient.id)
        .single();

      if (checkError || !existingClient) {
        console.error('Could not find client:', checkError);
        throw new Error('Could not find client to update');
      }

      console.log('Found client to update:', existingClient);

      // 2. Create auth user to get the auth_id
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountForm.email,
        password: accountForm.password,
        options: {
          data: {
            full_name: selectedClient.Name,
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData?.user?.id) {
        console.error('No user ID returned');
        throw new Error('Failed to get user ID from authentication');
      }

      console.log('Auth created with ID:', authData.user.id);

      // 3. Try direct SQL update
      const { data: updateResult, error: updateError } = await supabase
        .from('Clients')
        .upsert({
          id: selectedClient.id,
          Name: selectedClient.Name,
          Email: accountForm.email.toLowerCase(),
          auth_id: authData.user.id
        }, {
          onConflict: 'id'
        })
        .select();

      if (updateError) {
        console.error('Update failed:', updateError);
        throw updateError;
      }

      console.log('Update result:', updateResult);

      // 4. Double check the update worked
      const { data: checkResult } = await supabase
        .from('Clients')
        .select('id, Name, Email, auth_id')
        .eq('id', selectedClient.id)
        .single();

      console.log('Final check result:', checkResult);

      if (!checkResult?.Email || !checkResult?.auth_id) {
        throw new Error('Update verification failed - email or auth_id missing');
      }

      // 5. Show success message
      toast({
        title: "Success!",
        description: "Account created successfully. Please check email for confirmation.",
        variant: "default",
        duration: 3000,
        className: "bg-green-50"
      })

      // 6. Reset form and close modal
      setAccountForm({ email: '', password: '' });
      setShowAccountModal(false);
      
      // 7. Refresh the table
      await fetchClients();

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsCreatingAccount(false);
    }
  }

  return (
    <>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your clients and their properties</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 py-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="Living Water Subdivision">Living Water Subdivision</SelectItem>
              <SelectItem value="Havahills Estate">Havahills Estate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.Name}</TableCell>
                    <TableCell>{client.Email || '-'}</TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Home className="w-4 h-4 text-gray-500" />
                            <span>{client.properties.length} {client.properties.length === 1 ? 'Property' : 'Properties'}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2">
                          <div className="space-y-2">
                            {client.properties.map((property, index) => (
                              <div 
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                              >
                                <div className="space-y-1.5">
                                  <div className="text-sm font-medium text-gray-900">
                                    {property.Project !== '-' ? property.Project : 'No Property'}
                                  </div>
                                  {property.Project !== '-' && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium">Block</span>
                                        <span>{property.Block}</span>
                                      </div>
                                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium">Lot</span>
                                        <span>{property.Lot}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={client.Email ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client)
                          setShowAccountModal(true)
                        }}
                        disabled={!!client.Email}
                        className={client.Email ? "text-gray-500 hover:text-gray-500" : "bg-blue-600 hover:bg-blue-700 text-white"}
                      >
                        <UserPlus className={`w-4 h-4 mr-2 ${client.Email ? "text-gray-500" : "text-white"}`} />
                        {client.Email ? "Has Account" : "Create Account"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredClients.length > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredClients.length)} of {filteredClients.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>

      {/* Account Creation Modal */}
      <Dialog 
        open={showAccountModal} 
        onOpenChange={(open) => {
          if (!isCreatingAccount) {
            setShowAccountModal(open);
            if (!open) {
              setAccountForm({ email: '', password: '' });
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account for {selectedClient?.Name}</DialogTitle>
            <DialogDescription>
              Enter email and password for client's account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={accountForm.email}
                onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={accountForm.password}
                onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAccountModal(false)}
              disabled={isCreatingAccount}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAccount}
              disabled={isCreatingAccount || !accountForm.email || !accountForm.password}
            >
              {isCreatingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
