const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

function parseCaseFile(content, filename) {
  const lines = content.split('\n')
  let title = filename.replace('.md', '')
  let industry = ''
  let caseType = ''
  let currentSection = ''
  let contentBody = []

  for (const line of lines) {
    if (line.startsWith('# 案例编号：')) {
      // Skip
    } else if (line.startsWith('# 行业：')) {
      industry = line.replace('# 行业：', '').trim()
    } else if (line.startsWith('# 客户类型：')) {
      caseType = line.replace('# 客户类型：', '').trim()
    } else if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim()
    } else if (line.startsWith('## 成功原因')) {
      currentSection = '成功原因'
    } else if (line.startsWith('## 可复用的营销话术')) {
      currentSection = '营销话术'
    } else if (line.startsWith('#')) {
      title = line.replace('# ', '').replace('#', '').trim()
    } else if (currentSection && (currentSection === '客户背景' || currentSection === '客户需求' || currentSection === '沟通过程' || currentSection === '成交方案' || currentSection === '成功原因' || currentSection === '可复用的营销话术')) {
      contentBody.push(line)
    }
  }

  return {
    title,
    industry,
    case_type: caseType,
    content: contentBody.join('\n').trim()
  }
}

async function importCases() {
  const casesDir = path.join(__dirname, 'cases-import')
  const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.md'))

  console.log(`Found ${files.length} case files`)

  for (const file of files) {
    const filePath = path.join(casesDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const caseData = parseCaseFile(content, file)

    console.log(`Importing: ${caseData.title}`)

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
