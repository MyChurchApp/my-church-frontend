import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html } = body

    // Log das informações de contato recebidas
    console.log("=== NOVO CONTATO RECEBIDO ===")
    console.log("Para:", to)
    console.log("Assunto:", subject)
    console.log("Conteúdo:", html)
    console.log("===============================")

    // Aqui você pode integrar com qualquer serviço de email de sua escolha
    // como SendGrid, Mailgun, Nodemailer, etc.

    return NextResponse.json({
      success: true,
      message: "Contato recebido com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao processar contato:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar contato",
      },
      { status: 500 },
    )
  }
}
