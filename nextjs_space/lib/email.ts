
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'suporteplanejado@gmail.com';
const APP_NAME = 'Orçamento Planejado';

export async function sendWelcomeEmail(to: string, name: string, email: string, password: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 Bem-vindo ao ${APP_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #00bf63; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f6f6f6; padding: 30px; border-radius: 0 0 8px 8px; }
              .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00bf63; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .button { display: inline-block; background: #00bf63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #737373; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Bem-vindo ao ${APP_NAME}!</h1>
              </div>
              <div class="content">
                <p><strong>Olá, ${name}!</strong></p>
                
                <p>Sua conta foi criada com sucesso! Agora você pode começar a organizar suas finanças de forma inteligente.</p>
                
                <div class="credentials">
                  <h3 style="margin-top: 0; color: #00bf63;">🔑 Seus dados de acesso:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Senha temporária:</strong> ${password}</p>
                </div>
                
                <div class="warning">
                  <p style="margin: 0;"><strong>⚠️ IMPORTANTE:</strong> Por segurança, altere sua senha no primeiro acesso! Acesse seu perfil e defina uma nova senha.</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'https://orcamento-planejado.abacusai.app'}/auth/login" class="button">
                    Acessar minha conta
                  </a>
                </div>
                
                <p style="margin-top: 30px;">Qualquer dúvida, estamos à disposição!</p>
                <p>Equipe ${APP_NAME} 💚</p>
              </div>
              
              <div class="footer">
                <p>© 2025 ${APP_NAME}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://orcamento-planejado.abacusai.app'}/auth/reset-password?token=${resetToken}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🔒 Recuperação de senha - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #00bf63; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f6f6f6; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #00bf63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; color: #737373; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🔒 Recuperação de Senha</h1>
              </div>
              <div class="content">
                <p><strong>Olá!</strong></p>
                
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no ${APP_NAME}.</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">
                    Redefinir minha senha
                  </a>
                </div>
                
                <div class="warning">
                  <p style="margin: 0;"><strong>⚠️ ATENÇÃO:</strong> Este link é válido por 1 hora. Se você não solicitou esta alteração, ignore este email.</p>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #737373;">Se o botão não funcionar, copie e cole este link no navegador:</p>
                <p style="font-size: 12px; color: #737373; word-break: break-all;">${resetUrl}</p>
                
                <p style="margin-top: 30px;">Equipe ${APP_NAME} 💚</p>
              </div>
              
              <div class="footer">
                <p>© 2025 ${APP_NAME}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return { success: false, error };
  }
}
