const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cerobzjpalrroueereyh.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

function parseCaseFile(content, filename) {
  // Filename is like "001_科研服务_周敬霖_JL.md"
  const nameParts = filename.replace('.md', '').split('_')
  const caseNumber = nameParts[0]
  const industry = nameParts[1] || ''
  const clientName = nameParts.slice(2, -1).join('_') || ''
  const caseType = nameParts[nameParts.length - 1] || ''

  // Extract sections from content
  const lines = content.split('\n')
  let title = `${caseNumber}_${industry}_${clientName}`
  let industry_val = ''
  let case_type = ''
  let fullContent = content

  // Try to extract metadata from content
  for (const line of lines) {
    if (line.startsWith('# 行业：')) {
      industry_val = line.replace('# 行业：', '').trim()
    } else if (line.startsWith('# 客户类型：')) {
      case_type = line.replace('# 客户类型：', '').trim()
    }
  }

  return {
    title: industry_val ? `${industry_val}_${clientName}` : title,
    industry: industry_val || industry,
    case_type: case_type || caseType,
    content: fullContent
  }
}

async function importCases() {
  const casesDir = path.join(__dirname, 'cases-import')
  const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.md')).sort()

  console.log(`Found ${files.length} case files`)

  for (const file of files) {
    const filePath = path.join(casesDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const caseData = parseCaseFile(content, file)

    console.log(`Importing: ${caseData.title} (${caseData.industry}, ${caseData.case_type})`)

    const { data, error } = await supabase
      .from('cases')
      .insert([caseData])

    if (error) {
      console.error(`Error importing ${file}:`, error.message)
    } else {
      console.log(`Successfully imported: ${caseData.title}`)
    }
  }

  console.log('Import complete!')
}

importCases().catch(console.error)
