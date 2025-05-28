import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html } = body

    // Por enquanto, vamos simular o envio e logar as informações
    console.log("=== NOVO CONTATO RECEBIDO ===")
    console.log("Para:", to)
    console.log("Assunto:", subject)
    console.log("Conteúdo:", html)
    console.log("===============================")

    // Aqui você pode integrar com um serviço de email real como:
    // - Resend (recomendado para Vercel)
    // - SendGrid
    // - Nodemailer
    // - EmailJS

    // Exemplo com Resend (quando configurado):
    /*
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'contato@mychurchlab.net',
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      throw new Error(error.message)
    }
    */

    return NextResponse.json({
      success: true,
      message: "Email enviado com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return NextResponse.json({ success: false, message: "Erro ao enviar email" }, { status: 500 })
  }
}
