import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

interface PropertyRow {
  Block: string
  Lot: string
  'Lot Area': string
  'Price/SQM': string
  TSP: string
  'Misc. Fee': string
  VAT: string
  TCP: string
  Term: string
  'First MA': string
  '2nd-60th MA': string
  'First Due Month': string
  'Date of Reservation': string
  'Seller Name': string
  Realty: string
  Reservation: string
  Status: string
  Project: string
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function importProperties(file: File) {
  try {
    // Read the file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet) as PropertyRow[]

    // Process each row and insert into Supabase
    for (const row of data) {
      const tableName = row.Project === "Living Water Subdivision" ? 
        "Living Water Subdivision" : "Havahills Estate"

      const { error } = await supabase
        .from(tableName)
        .insert({
          Block: row.Block,
          Lot: row.Lot,
          'Lot Area': row['Lot Area'],
          'Price/SQM': row['Price/SQM'],
          TSP: row.TSP,
          'Misc. Fee': row['Misc. Fee'],
          VAT: row.VAT,
          TCP: row.TCP,
          Term: row.Term,
          'First MA': row['First MA'],
          '2nd-60th MA': row['2nd-60th MA'],
          'First Due Month': row['First Due Month'],
          'Date of Reservation': row['Date of Reservation'],
          'Seller Name': row['Seller Name'],
          Realty: row.Realty,
          Reservation: row.Reservation,
          Status: row.Status || 'Available',
          Project: row.Project,
        })

      if (error) throw error
    }

    return { success: true, message: 'Properties imported successfully' }
  } catch (error) {
    console.error('Error importing properties:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Failed to import properties' }
  }
}
