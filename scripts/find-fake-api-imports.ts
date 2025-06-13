import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

function findImports(dir: string, results: string[] = []): string[] {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        findImports(filePath, results)
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) {
      try {
        const content = readFileSync(filePath, "utf8")
        if (content.includes("fake-api") || content.includes("lib/fake-api")) {
          results.push(`${filePath}: Contains fake-api import`)

          // Show the specific lines
          const lines = content.split("\n")
          lines.forEach((line, index) => {
            if (line.includes("fake-api")) {
              results.push(`  Line ${index + 1}: ${line.trim()}`)
            }
          })
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  return results
}

const results = findImports(".")
if (results.length > 0) {
  console.log("Files with fake-api imports:")
  results.forEach((result) => console.log(result))
} else {
  console.log("No fake-api imports found!")
}
