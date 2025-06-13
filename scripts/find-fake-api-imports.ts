import * as fs from "fs"
import * as path from "path"

// Função para verificar se um arquivo contém a importação
function checkFileForImport(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return content.includes("@/lib/fake-api")
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, error)
    return false
  }
}

// Função para percorrer diretórios recursivamente
function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Ignorar node_modules e .git
      if (file !== "node_modules" && file !== ".git") {
        walkDir(filePath, callback)
      }
    } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
      callback(filePath)
    }
  })
}

// Diretório raiz do projeto
const rootDir = process.cwd()

console.log("Procurando por importações de @/lib/fake-api...")

const filesWithImport: string[] = []

// Percorrer todos os arquivos .ts e .tsx
walkDir(rootDir, (filePath) => {
  if (checkFileForImport(filePath)) {
    filesWithImport.push(filePath)
  }
})

if (filesWithImport.length > 0) {
  console.log("\nArquivos que contêm importações de @/lib/fake-api:")
  filesWithImport.forEach((file) => {
    console.log(`- ${path.relative(rootDir, file)}`)
  })
  console.log(`\nTotal: ${filesWithImport.length} arquivo(s)`)
} else {
  console.log("Nenhuma importação de @/lib/fake-api encontrada.")
}
