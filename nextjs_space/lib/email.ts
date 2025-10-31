import nodemailer from 'nodemailer';

const APP_NAME = 'Orçamento Planejado';

// Configuração do transporter do Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Validar se o email é válido
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Retry logic para envio de emails
async function sendEmailWithRetry(
  mailOptions: any,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<any> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Tentativa ${attempt}/${maxRetries} de envio...`);
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado com sucesso na tentativa ${attempt}`);
      return { success: true, result };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Falha na tentativa ${attempt}/${maxRetries}:`, error.message);
      
      // Se não for a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  // Se todas as tentativas falharam
  console.error(`💥 Todas as ${maxRetries} tentativas falharam`);
  return { success: false, error: lastError };
}

export async function sendWelcomeEmail(to: string, name: string, email: string, password: string) {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📧 ENVIANDO EMAIL DE BOAS-VINDAS');
    console.log('='.repeat(80));
    console.log('  → Para:', to);
    console.log('  → Nome:', name);
    console.log('  → Email (credencial):', email);
    console.log('  → Configuração GMAIL_USER:', process.env.GMAIL_USER);
    console.log('  → GMAIL_APP_PASSWORD configurado:', !!process.env.GMAIL_APP_PASSWORD);
    console.log('='.repeat(80));
    
    // Validar email
    if (!isValidEmail(to)) {
      console.error('❌ Email inválido:', to);
      return { success: false, error: new Error('Email inválido') };
    }
    
    const mailOptions = {
      from: `"${APP_NAME}" <${process.env.GMAIL_USER}>`,
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
                
                <p style="margin-top: 30px;">Qualquer dúvida, estamos à disposição em <strong>suporteplanejado@gmail.com</strong></p>
                <p>Equipe ${APP_NAME} 💚</p>
              </div>
              
              <div class="footer">
                <p>© 2025 ${APP_NAME}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    
    // Enviar com retry logic
    const result = await sendEmailWithRetry(mailOptions);
    
    if (result.success) {
      console.log('\n✅ EMAIL ENVIADO COM SUCESSO!');
      console.log('  → MessageID:', result.result.messageId);
      console.log('  → Response:', result.result.response);
      console.log('='.repeat(80) + '\n');
      return { success: true, messageId: result.result.messageId };
    } else {
      throw result.error;
    }
    
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ ERRO CRÍTICO AO ENVIAR EMAIL DE BOAS-VINDAS');
    console.error('='.repeat(80));
    console.error('  → Error:', error);
    console.error('  → Message:', (error as Error).message);
    console.error('  → Stack:', (error as Error).stack);
    console.error('='.repeat(80) + '\n');
    return { success: false, error };
  }
}

export async function sendCancellationEmail(to: string, name: string, reason: 'refunded' | 'cancelled') {
  const reasonText = reason === 'refunded' 
    ? 'reembolso da sua compra' 
    : 'cancelamento da sua assinatura';
  
  try {
    console.log('📧 Iniciando envio de email de cancelamento...');
    console.log('  → Para:', to);
    console.log('  → Nome:', name);
    console.log('  → Motivo:', reason);
    
    const result = await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Sua assinatura do ${APP_NAME} foi cancelada`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f6f6f6; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
              .button { display: inline-block; background: #00bf63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #737373; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">😔 Assinatura Cancelada</h1>
              </div>
              <div class="content">
                <p><strong>Olá, ${name}!</strong></p>
                
                <p>Recebemos a confirmação do <strong>${reasonText}</strong> e seu acesso ao ${APP_NAME} foi desativado.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #dc3545;">📋 O que isso significa:</h3>
                  <ul style="margin: 10px 0;">
                    <li>Seu acesso ao app foi <strong>bloqueado</strong></li>
                    <li>Você não poderá mais fazer login</li>
                    <li>Seus dados serão mantidos por 90 dias</li>
                  </ul>
                </div>
                
                <p><strong>💚 Sentiremos sua falta!</strong></p>
                <p>Se mudou de ideia ou teve algum problema, adoraríamos ter você de volta!</p>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'https://orcamento-planejado.abacusai.app'}" class="button">
                    Quero assinar novamente
                  </a>
                </div>
                
                <p style="margin-top: 30px;">Qualquer dúvida, estamos à disposição em <strong>suporteplanejado@gmail.com</strong></p>
                <p>Obrigado por ter feito parte da nossa comunidade! 💚</p>
                <p>Equipe ${APP_NAME}</p>
              </div>
              
              <div class="footer">
                <p>© 2025 ${APP_NAME}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log('✅ Email de cancelamento enviado com sucesso!');
    console.log('  → MessageID:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ ERRO ao enviar email de cancelamento:');
    console.error('  → Error:', error);
    console.error('  → Stack:', (error as Error).stack);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://orcamento-planejado.abacusai.app'}/auth/reset-password?token=${resetToken}`;
  
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.GMAIL_USER}>`,
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