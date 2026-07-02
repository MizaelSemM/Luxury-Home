import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas";
import nodemailer from "nodemailer";

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.parse(body);

    const transporter = createTransporter();

    if (transporter) {
      const mailOptions = {
        from: `"${parsed.name}" <${process.env.SMTP_USER || "contato@luxuryhome.com.br"}>`,
        to: process.env.CONTACT_EMAIL_TO || "mizaelborges44444@gmail.com",
        replyTo: parsed.email,
        subject: `Novo contato de ${parsed.name} - Luxury Home`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { color: #d4a853; font-size: 24px; margin: 0; font-family: 'Playfair Display', serif; }
              .header p { color: #999; margin: 8px 0 0; font-size: 14px; }
              .content { background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
              .field { margin-bottom: 20px; }
              .field-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 4px; }
              .field-value { font-size: 16px; color: #1a1a1a; margin: 0; }
              .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
              .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Luxury Home</h1>
                <p>Nova mensagem do formulário de contato</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">Nome</div>
                  <p class="field-value">${parsed.name}</p>
                </div>
                <div class="field">
                  <div class="field-label">E-mail</div>
                  <p class="field-value">
                    <a href="mailto:${parsed.email}" style="color: #d4a853;">${parsed.email}</a>
                  </p>
                </div>
                <hr class="divider" />
                <div class="field">
                  <div class="field-label">Mensagem</div>
                  <p class="field-value" style="line-height: 1.6;">${parsed.message.replace(/\n/g, "<br>")}</p>
                </div>
              </div>
              <div class="footer">
                <p>Enviado do site Luxury Home — ${new Date().toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.log("=== NOVO CONTATO (SMTP não configurado) ===");
      console.log("Nome:", parsed.name);
      console.log("Email:", parsed.email);
      console.log("Mensagem:", parsed.message);
      console.log("Destinatário:", process.env.CONTACT_EMAIL_TO);
      console.log("==========================================");
    }

    return NextResponse.json(
      {
        data: {
          message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", message: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao enviar mensagem", message: (error as Error).message },
      { status: 500 }
    );
  }
}
