import { useState, useEffect } from 'react'
import { cn } from "../lib/utils"
import styles from '../styles/table.module.css'
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { useToast } from "../components/ui/use-toast"
import { Toaster } from "../components/ui/toaster"
import { supabase } from "../lib/supabase"

interface Property {
  id: string
  block: string
  lot: string
  due: string
  dateOfReservation: string
  firstDue: string
  terms: string
  amount: number
  realty: string
  buyersName: string
  sellerName: string
  salesDirector: string
  broker: string
  lotSize: string
  price: number
  paymentScheme: string
  vatStatus: string
  tsp: number
  modeOfPayment: string
  reservation: number
  commPrice: number
  miscFee: number
  vat: number
  tcp: number
  firstMA: number
  firstMAWithHoldingFee: number
  secondTo48thMA: number
  newTerm: string
  pasaloPrice: number
  newMA: number
  status: 'Available' | 'Reserved' | 'Sold'
  project: string
  createdAt?: string

  // LWS specific fields
  dueDate15_30?: string
  firstDueMonth?: string
  brokerRealty?: string
  lotArea?: string
  pricePerSQM?: string
  netContractPrice?: number
  optionalAdvancePayment?: number
  firstMANetOfAdvancePayment?: number
  secondTo60thMA?: number
  year?: string
}

// Define the header type
type HeaderKey = keyof Property;

// Define the header interface
interface TableHeader {
  key: HeaderKey;
  label: string;
  width: string;
}

// Define table headers for each project
const projectHeaders: Record<string, TableHeader[]> = {
  'Living Water Subdivision': [
    { key: 'block', label: 'Block', width: '70px' },
    { key: 'lot', label: 'Lot', width: '70px' },
    { key: 'dueDate15_30', label: 'Due Date 15/30', width: '110px' },
    { key: 'firstDueMonth', label: 'First Due Month', width: '110px' },
    { key: 'amount', label: 'Amount', width: '110px' },
    { key: 'realty', label: 'Realty', width: '110px' },
    { key: 'buyersName', label: 'Buyers Name', width: '110px' },
    { key: 'dateOfReservation', label: 'Date of Reservation', width: '110px' },
    { key: 'sellerName', label: 'Seller Name', width: '110px' },
    { key: 'brokerRealty', label: 'Broker / Realty', width: '110px' },
    { key: 'reservation', label: 'Reservation', width: '110px' },
    { key: 'lotArea', label: 'Lot Area', width: '110px' },
    { key: 'pricePerSQM', label: 'Price per sqm', width: '110px' },
    { key: 'tcp', label: 'TCP', width: '110px' },
    { key: 'tsp', label: 'TSP', width: '110px' },
    { key: 'miscFee', label: 'MISC FEE', width: '110px' },
    { key: 'netContractPrice', label: 'Net Contract Price', width: '110px' },
    { key: 'terms', label: 'Term', width: '110px' },
    { key: 'firstMA', label: 'First MA', width: '110px' },
    { key: 'optionalAdvancePayment', label: 'Optional: Advance Payment', width: '110px' },
    { key: 'firstMANetOfAdvancePayment', label: '1st MA net of Advance Payment', width: '110px' },
    { key: 'secondTo60thMA', label: '2ndto60th MA', width: '110px' },
    { key: 'year', label: 'Year', width: '110px' },
    { key: 'status', label: 'Status', width: '110px' }
  ],
  'Havahills Estate': [
    { key: 'block', label: 'Block', width: '70px' },
    { key: 'lot', label: 'Lot', width: '70px' },
    { key: 'due', label: 'Due', width: '110px' },
    { key: 'dateOfReservation', label: 'Date of Reservation', width: '110px' },
    { key: 'firstDue', label: 'First Due', width: '110px' },
    { key: 'terms', label: 'Terms', width: '110px' },
    { key: 'amount', label: 'Amount', width: '110px' },
    { key: 'realty', label: 'Realty', width: '110px' },
    { key: 'buyersName', label: 'Buyers Name', width: '110px' },
    { key: 'sellerName', label: 'Seller Name', width: '110px' },
    { key: 'salesDirector', label: 'Sales Director', width: '110px' },
    { key: 'broker', label: 'Broker', width: '110px' },
    { key: 'lotSize', label: 'Lot Size', width: '110px' },
    { key: 'price', label: 'Price', width: '110px' },
    { key: 'paymentScheme', label: 'Payment Scheme', width: '110px' },
    { key: 'vatStatus', label: 'Vat Status', width: '110px' },
    { key: 'tsp', label: 'TSP', width: '110px' },
    { key: 'modeOfPayment', label: 'Mode of Payment', width: '110px' },
    { key: 'reservation', label: 'Reservation', width: '110px' },
    { key: 'commPrice', label: 'Comm Price', width: '110px' },
    { key: 'miscFee', label: 'Misc Fee', width: '110px' },
    { key: 'vat', label: 'Vat', width: '110px' },
    { key: 'tcp', label: 'TCP', width: '110px' },
    { key: 'firstMA', label: '1st MA', width: '110px' },
    { key: 'firstMAWithHoldingFee', label: '1ST MA with Holding Fee', width: '110px' },
    { key: 'secondTo48thMA', label: '2ND TO 48TH MA', width: '110px' },
    { key: 'newTerm', label: 'NEW TERM', width: '110px' },
    { key: 'pasaloPrice', label: 'PASALO PRICE', width: '110px' },
    { key: 'newMA', label: 'NEW MA', width: '110px' },
    { key: 'status', label: 'Status', width: '110px' }
  ]
} as const;

export default function InventoryPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState("Living Water Subdivision")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch properties from Supabase
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      
      // Fetch from single table based on selected project
      const tableName = selectedProject;
      console.log('Fetching from table:', tableName);
      
      let query = supabase
        .from(tableName)
        .select('*')
        .order('Block', { ascending: true }) // Primary sort by Block
        .order('Lot', { ascending: true }); // Secondary sort by Lot

      // Add search filter if searchQuery exists
      if (searchQuery) {
        query = query.or(`Block.ilike.%${searchQuery}%,Lot.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('No data returned from Supabase');
        setProperties([]);
        return;
      }

      console.log('Raw data from Supabase:', data);

      // Transform the data to match our camelCase property names
      const transformedData = data.map(item => {
        if (!item) return null;

        try {
          const transformed: Property = {
            id: item.id?.toString() || '',
            block: item.Block || '',
            lot: item.Lot || '',
            due: item.Due || '',
            dateOfReservation: item['Date of Reservation'] || '',
            firstDue: item['First Due'] || '',
            terms: item.Terms || '',
            amount: Number(item.Amount) || 0,
            realty: item.Realty || '',
            buyersName: item['Buyers Name'] || item.Owner || '',
            sellerName: item['Seller Name'] || '',
            salesDirector: item['Sales Director'] || '',
            broker: item.Broker || '',
            lotSize: item['Lot Size'] || item['Lot Area'] || '',
            price: Number(item.Price) || 0,
            paymentScheme: item['Payment Scheme'] || '',
            vatStatus: item['Vat Status'] || '',
            tsp: Number(item.TSP) || 0,
            modeOfPayment: item['Mode of Payment'] || '',
            reservation: Number(item.Reservation) || 0,
            commPrice: Number(item['Comm Price']) || 0,
            miscFee: Number(item['MISC FEE'] || item['Misc Fee']) || 0,
            vat: Number(item.Vat) || 0,
            tcp: Number(item.TCP) || 0,
            firstMA: Number(item['First MA'] || item['1st MA']) || 0,
            firstMAWithHoldingFee: Number(item['1ST MA with Holding Fee']) || 0,
            secondTo48thMA: Number(item['2ND TO 48TH MA']) || 0,
            newTerm: item['NEW TERM'] || '',
            pasaloPrice: Number(item['PASALO PRICE']) || 0,
            newMA: Number(item['NEW MA']) || 0,
            status: ((item.Status || 'Available') as string).trim() as 'Available' | 'Reserved' | 'Sold',
            project: tableName,
            createdAt: item.created_at || '',

            // LWS specific fields
            dueDate15_30: item['Due Date 15/30'] || '',
            firstDueMonth: item['First Due Month'] || '',
            brokerRealty: item['Broker / Realty'] || '',
            pricePerSQM: item['Price per sqm'] || '',
            netContractPrice: Number(item['Net Contract Price']) || 0,
            optionalAdvancePayment: Number(item['Optional: Advance Payment']) || 0,
            firstMANetOfAdvancePayment: Number(item['1st MA net of Advance Payment']) || 0,
            secondTo60thMA: Number(item['2ndto60th MA']) || 0,
            year: item.Year || ''
          };
          return transformed;
        } catch (err) {
          console.error('Error transforming item:', item, err);
          return null;
        }
      }).filter((item): item is Property => item !== null);

      console.log('Final transformed data:', transformedData);
      setProperties(transformedData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch properties",
        variant: "destructive",
      });
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or when selected project changes
  useEffect(() => {
    fetchProperties();
  }, [selectedProject]);

  // Filter properties based on search query and status
  const filteredProperties = properties
    .filter(property => {
      if (!property) return false;

      const matchesSearch = !searchQuery || 
        (property.block?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (property.lot?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (property.buyersName?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Normalize status values for comparison
      const propertyStatus = (property.status || '').trim().toLowerCase();
      const filterStatus = statusFilter.toLowerCase();
      
      // Debug log for status matching
      console.log('Property:', property.block, 'Lot:', property.lot, 'Status:', propertyStatus, 'Filter:', filterStatus);
      
      const matchesStatus = statusFilter === 'all' || propertyStatus === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Convert block to number for proper numeric sorting
      const blockA = parseInt(a.block) || 0;
      const blockB = parseInt(b.block) || 0;
      
      // First compare blocks
      if (blockA !== blockB) {
        return blockA - blockB;
      }
      
      // If blocks are equal, compare lots
      const lotA = parseInt(a.lot) || 0;
      const lotB = parseInt(b.lot) || 0;
      return lotA - lotB;
    });

  // Log filtered results
  console.log('Total properties:', properties.length);
  console.log('Filtered properties:', filteredProperties.length);
  console.log('Status filter:', statusFilter);
  console.log('Properties by status:', properties.reduce((acc, prop) => {
    const status = prop.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));

  // Calculate pagination
  const totalPages = Math.ceil((filteredProperties?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProperties = filteredProperties.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container-fluid px-4 py-4 space-y-3 min-h-screen">
      <Toaster />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            View and manage property inventory
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 w-full">
          <div className="relative h-[40px] bg-white rounded-md shadow-sm border flex items-center px-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search by block, lot, or client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm px-2"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-[160px] h-[40px] bg-white rounded-md shadow-sm border">
            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
                setCurrentPage(1); // Reset to first page when project changes
              }}
            >
              <SelectTrigger className="h-full border-0 text-sm px-3">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Living Water Subdivision">Living Water Subdivision</SelectItem>
                <SelectItem value="Havahills Estate">Havahills Estate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[160px] h-[40px] bg-white rounded-md shadow-sm border">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
            >
              <SelectTrigger className="h-full border-0 text-sm px-3">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white flex-1">
        <div 
          className={cn("h-[calc(100vh-405px)]", styles.tableContainer)}
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          onWheel={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              const container = e.currentTarget;
              container.scrollLeft += e.deltaY;
            }
          }}
        >
          <div className="min-w-max">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-white z-20">
                <TableRow className="text-sm">
                  {projectHeaders[selectedProject].map((header, index) => (
                    <TableHead
                      key={header.key}
                      className={cn(
                        "font-medium text-center",
                        header.width,
                        `min-w-[${header.width}]`,
                        "py-3",
                        index === 0 && "bg-white sticky left-0 z-30",
                        header.key === 'status' && "bg-white sticky right-0 z-30"
                      )}
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={projectHeaders[selectedProject].length} className="h-[60px] text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : displayedProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={projectHeaders[selectedProject].length} className="h-[60px] text-center">
                      No properties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProperties.map((property) => (
                    <TableRow key={property.id} className="text-sm">
                      {projectHeaders[selectedProject].map((header, index) => (
                        <TableCell
                          key={header.key}
                          className={cn(
                            "text-center",
                            header.width,
                            "py-3",
                            index === 0 && "bg-white sticky left-0 z-20",
                            header.key === 'status' && "bg-white sticky right-0 z-30"
                          )}
                        >
                          {header.key === 'status' ? (
                            <Badge
                              variant={
                                property[header.key] === 'Available' ? 'success' :
                                property[header.key] === 'Reserved' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {property[header.key]}
                            </Badge>
                          ) : (
                            property[header.key]?.toString() || ''
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredProperties.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
