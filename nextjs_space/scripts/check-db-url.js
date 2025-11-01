// Script para verificar qual DATABASE_URL está sendo usada
console.log('\n🔍 ===== VERIFICAÇÃO DE DATABASE_URL =====\n');
console.log('DATABASE_URL definida:', process.env.DATABASE_URL ? 'SIM' : 'NÃO');

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  
  // Extrai o host da URL sem expor a senha completa
  const match = url.match(/@([^:]+):(\d+)/);
  if (match) {
    console.log('🌐 Host do banco:', match[1]);
    console.log('🔌 Porta:', match[2]);
  }
  
  // Verifica se tem pgbouncer
  console.log('⚡ pgbouncer=true:', url.includes('pgbouncer=true') ? 'SIM ✅' : 'NÃO ❌');
  
  // Verifica se é Supabase (ANTIGO)
  if (url.includes('supabase.com')) {
    console.log('❌ ERRO: Usando Supabase (antigo)!');
  }
  
  // Verifica se é Abacus (CORRETO)
  if (url.includes('hosteddb.reai.io')) {
    console.log('✅ CORRETO: Usando Abacus!');
  }
}

// Verifica outras variáveis que podem sobrescrever
console.log('\n🔍 Verificando outras variáveis PostgreSQL:\n');
const pgVars = [
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_POOLING'
];

pgVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`⚠️  ${varName} está definida!`);
    const url = process.env[varName];
    if (url.includes('supabase.com')) {
      console.log(`   ❌ E está apontando para Supabase!`);
    }
  }
});

console.log('\n🔍 ===== FIM DA VERIFICAÇÃO =====\n');
