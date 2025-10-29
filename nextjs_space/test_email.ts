import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('🔑 API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
  console.log('📧 Enviando email de teste...\n');
  
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'viniciusoliveira.dev@gmail.com', // COLOQUE SEU EMAIL AQUI
      subject: 'Teste - Orçamento Planejado',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #00bf63;">🎉 Email de Teste!</h2>
          <p>Este é um teste do sistema de email do <strong>Orçamento Planejado</strong>.</p>
          <p>Se você recebeu este email, significa que o Resend está funcionando corretamente!</p>
          <hr>
          <p style="color: #737373; font-size: 12px;">
            Email: teste@example.com<br>
            Senha: 12345678
          </p>
        </div>
      `,
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Resposta:', data);
    console.log('📬 Para:', 'viniciusoliveira.dev@gmail.com');
    
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:');
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error);
  }
}

main();
