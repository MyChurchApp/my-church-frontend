// Utilitários para exportação de dados

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar.")
    return
  }

  // Obter as chaves do primeiro objeto para criar o cabeçalho
  const headers = Object.keys(data[0])

  // Criar o conteúdo CSV
  const csvContent = [
    // Cabeçalho
    headers.join(","),
    // Dados
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escapar aspas e adicionar aspas se necessário
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ""
        })
        .join(","),
    ),
  ].join("\n")

  // Criar e baixar o arquivo
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function exportAssetsToCSV(assets: any[]) {
  // Preparar dados para exportação
  const exportData = assets.map((asset) => ({
    Nome: asset.name || "",
    Código: asset.identificationCode || "",
    Categoria: getAssetTypeName(asset.type),
    Descrição: asset.description || "",
    Valor: `R$ ${asset.value?.toFixed(2) || "0,00"}`,
    Condição: asset.condition || "",
    Localização: asset.location || "",
    Responsável: asset.responsible || "",
    "Data de Compra": asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString("pt-BR") : "",
    "Última Manutenção": asset.lastMaintenance ? new Date(asset.lastMaintenance).toLocaleDateString("pt-BR") : "",
    "Próxima Manutenção": asset.nextMaintenance ? new Date(asset.nextMaintenance).toLocaleDateString("pt-BR") : "",
    "Garantia até": asset.warrantyUntil ? new Date(asset.warrantyUntil).toLocaleDateString("pt-BR") : "",
    Observações: asset.notes || "",
    "Data de Cadastro": asset.createdAt ? new Date(asset.createdAt).toLocaleDateString("pt-BR") : "",
  }))

  const filename = `ativos-igreja-${new Date().toISOString().split("T")[0]}`
  exportToCSV(exportData, filename)
}

// Função auxiliar para obter nome do tipo de ativo
function getAssetTypeName(type: number): string {
  const types = {
    1: "Equipamento",
    2: "Mobiliário",
    3: "Veículo",
    4: "Imóvel",
    5: "Tecnologia",
    6: "Outros",
  }
  return types[type as keyof typeof types] || "Desconhecido"
}
