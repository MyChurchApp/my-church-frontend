import * as fs from "fs"
import * as path from "path"

// Função para verificar se um arquivo contém importações de fake-api
function checkFileForFakeApiImports(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return content.includes("@/lib/fake-api")
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error)
    return false
  }
}

// Função para percorrer diretórios recursivamente
function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f)
    const isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      walkDir(dirPath, callback)
    } else {
      callback(path.join(dir, f))
    }
  })
}

// Diretórios a serem verificados
const directories = ["app", "components", "lib", "services", "contexts", "hooks"]
const fileExtensions = [".ts", ".tsx", ".js", ".jsx"]

// Encontrar arquivos com importações de fake-api
const filesWithFakeApiImports: string[] = []

directories.forEach((dir) => {
  if (fs.existsSync(dir)) {
    walkDir(dir, (filePath) => {
      if (fileExtensions.some((ext) => filePath.endsWith(ext))) {
        if (checkFileForFakeApiImports(filePath)) {
          filesWithFakeApiImports.push(filePath)
        }
      }
    })
  }
})

// Exibir resultados
console.log("Arquivos que ainda importam @/lib/fake-api:")
filesWithFakeApiImports.forEach((file) => {
  console.log(`- ${file}`)
})

console.log(`\nTotal: ${filesWithFakeApiImports.length} arquivo(s)`)
