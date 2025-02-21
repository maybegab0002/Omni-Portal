import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User2, FileText, Upload, FileCheck, Loader2, X, Cloud, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { useToast } from '../components/ui/use-toast'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

interface Document {
  id: number
  Name: string
  Address: string
  "TIN ID": string
  Email: string
  "Contact No": string
  "Marital Status": string
}

interface Client {
  id: string
  Name: string
  Email: string
  Project: string
  Block: string
  Lot: string
  documents: Document[]
}

interface DocumentFile {
  name: string
  path: string
  icon: React.ReactNode
  category: 'identification' | 'property' | 'personal'
}

interface DocumentForm {
  address: string
  tinId: string
  email: string
  contactNo: string
  maritalStatus: string
  raDocument: File | null
  bisDocument: File | null
  ctsDocument: File | null
  psaDocument: File | null
  proofOfBilling: File | null
  validId: File | null
  validId2: File | null
}

interface FileUploadProps {
  id: string
  label: string
  file: File | null
  onFileChange: (file: File | null) => void
}

function FileUploadDropzone({ id, label, file, onFileChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      onFileChange(droppedFile)
    }
  }, [onFileChange])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileChange(selectedFile)
    }
  }, [onFileChange])

  const removeFile = useCallback(() => {
    onFileChange(null)
  }, [onFileChange])

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300",
          "group"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={id}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        <div className="p-4 text-center">
          {file ? (
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  removeFile()
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
              <Cloud className="w-8 h-8 text-gray-400 group-hover:text-gray-500" />
              <div>
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const initialDocumentForm: DocumentForm = {
  address: '',
  tinId: '',
  email: '',
  contactNo: '',
  maritalStatus: '',
  raDocument: null,
  bisDocument: null,
  ctsDocument: null,
  psaDocument: null,
  proofOfBilling: null,
  validId: null,
  validId2: null
}

export default function DocumentsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showViewAllModal, setShowViewAllModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [documentForm, setDocumentForm] = useState<DocumentForm>(initialDocumentForm)
  const [viewAllFiles, setViewAllFiles] = useState<{ name: string; url: string }[]>([])
  const [loadingViewAll, setLoadingViewAll] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 5

  // Function to preload images
  const preloadImages = async (files: { name: string; url: string }[]) => {
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
    
    if (imageFiles.length === 0) {
      return true // No images to load
    }

    const loadPromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = file.url
      })
    })

    const results = await Promise.all(loadPromises)
    return results.every(result => result)
  }

  // Fetch clients with their properties
  const fetchClients = async () => {
    setIsLoading(true)
    try {
      // First get all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('Clients')
        .select('*')

      if (clientsError) throw clientsError

      // For each client, check both property tables and get their documents
      const clientsWithProperties = await Promise.all(
        clientsData.map(async (client) => {
          // Check Living Water Subdivision
          const { data: livingWaterData } = await supabase
            .from('Living Water Subdivision')
            .select('Block, Lot')
            .eq('Owner', client.Name)
            .single()

          // Check Havahills Estate
          const { data: havahillsData } = await supabase
            .from('Havahills Estate')
            .select('Block, Lot')
            .eq('Owner', client.Name)
            .single()

          // Get client's documents
          const { data: documentsData } = await supabase
            .from('Documents')
            .select('*')
            .eq('Name', client.Name)

          if (livingWaterData) {
            return {
              ...client,
              Project: 'Living Water Subdivision',
              Block: livingWaterData.Block,
              Lot: livingWaterData.Lot,
              documents: documentsData || []
            }
          } else if (havahillsData) {
            return {
              ...client,
              Project: 'Havahills Estate',
              Block: havahillsData.Block,
              Lot: havahillsData.Lot,
              documents: documentsData || []
            }
          }

          return {
            ...client,
            Project: '-',
            Block: '-',
            Lot: '-',
            documents: documentsData || []
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

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.Project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.Block.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.Lot.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / cardsPerPage)
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  )

  const handleUploadClick = (client: Client) => {
    setSelectedClient(client)
    setShowDocumentModal(true)
  }

  const documentTypes: DocumentFile[] = [
    { 
      name: 'RA Document', 
      path: 'ra-document',
      icon: <FileCheck className="w-4 h-4" />,
      category: 'property'
    },
    { 
      name: 'BIS Document', 
      path: 'bis-document',
      icon: <FileCheck className="w-4 h-4" />,
      category: 'property'
    },
    { 
      name: 'CTS Document', 
      path: 'cts-document',
      icon: <FileCheck className="w-4 h-4" />,
      category: 'property'
    },
    { 
      name: 'PSA Document', 
      path: 'psa-document',
      icon: <FileText className="w-4 h-4" />,
      category: 'identification'
    },
    { 
      name: 'Proof of Billing', 
      path: 'proof-of-billing',
      icon: <FileText className="w-4 h-4" />,
      category: 'personal'
    },
    { 
      name: 'Valid ID 1', 
      path: 'valid-id-1',
      icon: <FileText className="w-4 h-4" />,
      category: 'identification'
    },
    { 
      name: 'Valid ID 2', 
      path: 'valid-id-2',
      icon: <FileText className="w-4 h-4" />,
      category: 'identification'
    }
  ]

  const handleUploadDocuments = async () => {
    if (!selectedClient) return;

    try {
      setIsSaving(true);
      setUploadProgress('Starting upload...');

      // First, save the document details to the Documents table
      const { data: documentRecord, error: documentError } = await supabase
        .from('Documents')
        .insert([
          {
            Name: selectedClient.Name,
            Address: documentForm.address,
            "TIN ID": documentForm.tinId,
            Email: documentForm.email,
            "Contact No": documentForm.contactNo,
            "Marital Status": documentForm.maritalStatus
          }
        ])
        .select()
        .single();

      if (documentError) {
        throw new Error(`Failed to save document details: ${documentError.message}`);
      }

      // Define the required documents with their categories
      const requiredDocuments = [
        { 
          file: documentForm.raDocument, 
          name: 'Reservation Agreement', 
          category: 'Property Documents'
        },
        { 
          file: documentForm.bisDocument, 
          name: 'BIS Document', 
          category: 'Property Documents'
        },
        { 
          file: documentForm.ctsDocument, 
          name: 'CTS Document', 
          category: 'Property Documents'
        },
        { 
          file: documentForm.psaDocument, 
          name: 'PSA Birth Certificate', 
          category: 'Personal Documents'
        },
        { 
          file: documentForm.proofOfBilling, 
          name: 'Proof of Billing', 
          category: 'Personal Documents'
        },
        { 
          file: documentForm.validId, 
          name: 'Valid ID 1', 
          category: 'Personal Documents'
        },
        { 
          file: documentForm.validId2, 
          name: 'Valid ID 2', 
          category: 'Personal Documents'
        }
      ];

      let uploadErrors = [];

      // Upload each file to the storage bucket
      for (const doc of requiredDocuments) {
        if (doc.file) {
          setUploadProgress(`Uploading ${doc.name}...`);
          
          // Create a clean filename with timestamp
          const timestamp = new Date().getTime();
          const cleanFileName = doc.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          
          // Organize files by client name, category, and document type
          const filePath = `${selectedClient.Name}/${doc.category}/${doc.name}/${timestamp}-${cleanFileName}`;

          const { error: uploadError } = await supabase.storage
            .from('Clients Document')
            .upload(filePath, doc.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error(`Error uploading ${doc.name}:`, uploadError);
            uploadErrors.push({
              name: doc.name,
              error: uploadError.message
            });
          }
        }
      }

      // Handle any upload errors
      if (uploadErrors.length > 0) {
        const errorMessages = uploadErrors.map(err => `${err.name}: ${err.error}`).join('\n');
        toast({
          title: `${uploadErrors.length} file(s) failed to upload`,
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        // Success notification if all uploads succeeded
        toast({
          title: "Success",
          description: "Document details and all files uploaded successfully",
        });
      }

      // Reset form and close modal
      setDocumentForm(initialDocumentForm);
      setShowDocumentModal(false);
      
      // Refresh the clients list to show new documents
      await fetchClients();

    } catch (error) {
      console.error('Error in document upload:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process document upload",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-medium tracking-tight">Client Documents</h2>
          <p className="text-muted-foreground">
            Manage and organize your clients' documents and requirements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No clients found
              </div>
            ) : (
              <>
                {paginatedClients.map((client) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{client.Name}</h3>
                            <p className="text-xs text-gray-500">{client.Project}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              try {
                                setLoadingViewAll(true)
                                setImagesLoaded(false)

                                // Get all documents for this client
                                const { data: documents } = await supabase
                                  .from('Documents')
                                  .select('*')
                                  .eq('Name', client.Name)

                                if (!documents) {
                                  throw new Error('Could not find documents')
                                }

                                // Get files for each document
                                const allFiles = await Promise.all(
                                  documents.map(async (doc) => {
                                    const { data: files } = await supabase.storage
                                      .from('Clients Document')
                                      .list(`${client.Name}/${doc.id}`)
                                    
                                    if (!files) return []

                                    return Promise.all(
                                      files.map(async (file) => {
                                        const { data } = await supabase.storage
                                          .from('Clients Document')
                                          .createSignedUrl(`${client.Name}/${doc.id}/${file.name}`, 3600)
                                       
                                        return {
                                          name: file.name,
                                          url: data?.signedUrl || ''
                                        }
                                      })
                                    )
                                  })
                                )

                                const files = allFiles.flat().filter(file => file.url)
                                
                                // Preload images before showing modal
                                await preloadImages(files)
                                setViewAllFiles(files)
                                setImagesLoaded(true)
                                setShowViewAllModal(true)
                              } catch (error) {
                                console.error('Error loading files:', error)
                                toast({
                                  title: "Error",
                                  description: "Failed to load files",
                                  variant: "destructive",
                                })
                              } finally {
                                setLoadingViewAll(false)
                              }
                            }}
                          >
                            {loadingViewAll ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            View All
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => handleUploadClick(client)}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Documents
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      {client.documents.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center">
                          No documents yet
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {documentTypes.map((item) => (
                            <Button
                              key={item.path}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={async () => {
                                try {
                                  // First, determine the category based on document type
                                  const category = item.name === 'Reservation Agreement' || 
                                                 item.name === 'BIS Document' || 
                                                 item.name === 'CTS Document' 
                                                 ? 'Property Documents' : 'Personal Documents';
                                  
                                  // Get the list of files in the document's specific folder
                                  const { data: files, error: listError } = await supabase.storage
                                    .from('Clients Document')
                                    .list(`${client.Name}/${category}/${item.name}`);

                                  if (listError) {
                                    throw listError;
                                  }

                                  if (!files || files.length === 0) {
                                    toast({
                                      title: "File Not Found",
                                      description: `No ${item.name} uploaded yet`,
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  // Get the most recent file (last uploaded)
                                  const latestFile = files.sort((a, b) => {
                                    const timeA = parseInt(a.name.split('-')[0]) || 0;
                                    const timeB = parseInt(b.name.split('-')[0]) || 0;
                                    return timeB - timeA;
                                  })[0];

                                  // Get a signed URL for the file
                                  const { data: urlData, error: urlError } = await supabase.storage
                                    .from('Clients Document')
                                    .createSignedUrl(
                                      `${client.Name}/${category}/${item.name}/${latestFile.name}`,
                                      3600 // URL valid for 1 hour
                                    );

                                  if (urlError) {
                                    throw urlError;
                                  }

                                  if (!urlData?.signedUrl) {
                                    throw new Error('Failed to generate URL');
                                  }

                                  // Open the file in a new tab
                                  window.open(urlData.signedUrl, '_blank');

                                } catch (error) {
                                  console.error('Error accessing file:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to access the file",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              {item.icon}
                              <span className="ml-2">{item.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {/* Pagination Controls */}
                <div className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredClients.length > 0 ? ((currentPage - 1) * cardsPerPage) + 1 : 0} to {Math.min(currentPage * cardsPerPage, filteredClients.length)} of {filteredClients.length} entries
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
              </>
            )}
          </div>
        </div>

      </div>

      {/* Document Upload Modal */}
      <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload Documents for {selectedClient?.Name}</DialogTitle>
            <DialogDescription>
              Fill in the client's information and upload the required documents
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={documentForm.address}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tinId">TIN ID</Label>
                <Input
                  id="tinId"
                  value={documentForm.tinId}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, tinId: e.target.value }))}
                  placeholder="Enter TIN ID"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={documentForm.email}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNo">Contact Number</Label>
                <Input
                  id="contactNo"
                  value={documentForm.contactNo}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, contactNo: e.target.value }))}
                  placeholder="Enter contact number"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select 
                value={documentForm.maritalStatus}
                onValueChange={(value) => setDocumentForm(prev => ({ ...prev, maritalStatus: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              <Label className="text-base font-semibold">Required Documents</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <FileUploadDropzone
                  id="raDocument"
                  label="Reservation Agreement"
                  file={documentForm.raDocument}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, raDocument: file }))}
                />

                <FileUploadDropzone
                  id="bisDocument"
                  label="BIS"
                  file={documentForm.bisDocument}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, bisDocument: file }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FileUploadDropzone
                  id="ctsDocument"
                  label="CTS"
                  file={documentForm.ctsDocument}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, ctsDocument: file }))}
                />

                <FileUploadDropzone
                  id="psaDocument"
                  label="PSA Birth Certificate"
                  file={documentForm.psaDocument}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, psaDocument: file }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FileUploadDropzone
                  id="proofOfBilling"
                  label="Proof of Billing"
                  file={documentForm.proofOfBilling}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, proofOfBilling: file }))}
                />

                <FileUploadDropzone
                  id="validId"
                  label="Valid ID 1"
                  file={documentForm.validId}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, validId: file }))}
                />
              </div>

              <div className="grid gap-2">
                <FileUploadDropzone
                  id="validId2"
                  label="Valid ID 2"
                  file={documentForm.validId2}
                  onFileChange={(file) => setDocumentForm(prev => ({ ...prev, validId2: file }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDocumentModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadDocuments}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </>
                )}
              </Button>
            </div>
            {uploadProgress && (
              <p className="text-sm text-muted-foreground mt-2">
                {uploadProgress}
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Modal */}
      <Dialog open={showViewAllModal} onOpenChange={setShowViewAllModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Files</DialogTitle>
          </DialogHeader>
          
          <div 
            className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100/50 hover:scrollbar-thumb-gray-400 scrollbar-track-rounded-lg"
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {!imagesLoaded ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="flex gap-4 min-w-min px-1 py-2">
                {viewAllFiles.map((file, index) => {
                  const isPDF = file.name.toLowerCase().endsWith('.pdf')
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)

                  return (
                    <div key={index} className="w-48 flex-shrink-0">
                      <div className="aspect-square rounded-lg border overflow-hidden bg-gray-100">
                        {isPDF ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                        ) : isImage ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        {file.name}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
