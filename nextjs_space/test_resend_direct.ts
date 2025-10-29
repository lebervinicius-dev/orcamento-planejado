import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🔑 API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
  console.log('📧 Enviando email de teste DIRETO...\n');
  
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'viniciusleber@gmail.com',
      subject: 'TESTE URGENTE - Orçamento Planejado',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f6f6f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #00bf63;">🔥 TESTE DE EMAIL</h1>
            <p style="font-size: 18px;">Se você recebeu este email, o Resend está funcionando!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <hr>
            <p style="color: #737373; font-size: 14px;">
              Este é um teste para verificar se o email está chegando corretamente.
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ SUCESSO! Email enviado!');
    console.log('📊 Resposta completa:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ ERRO COMPLETO:');
    console.error(error);
  }
}

testEmail();
