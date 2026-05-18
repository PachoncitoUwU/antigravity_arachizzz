const pass = 'Solorachiz6767';
const ref  = 'vfvhkzfoadbkofpkswbd';

const urls = [
  // Pooler transaction (puerto 6543) — usuario con ref
  `postgresql://postgres.${ref}:${pass}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  // Pooler session (puerto 5432 del pooler) — usuario con ref
  `postgresql://postgres.${ref}:${pass}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  // Directo (puerto 5432) — usuario simple
  `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`,
  // Directo — usuario con ref
  `postgresql://postgres.${ref}:${pass}@db.${ref}.supabase.co:5432/postgres`,
];

const { PrismaClient } = require('@prisma/client');

(async () => {
  for (const url of urls) {
    const label = url.replace(pass, '***');
    process.stdout.write(`Probando ${label.substring(13, 80)}... `);
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
      await p.$connect();
      console.log('✅ FUNCIONA');
      console.log('\n✅ URL correcta:\n' + url);
      await p.$disconnect();
      process.exit(0);
    } catch (e) {
      const msg = e.message.split('\n')[0].replace(/^.*FATAL: /, '');
      console.log('❌ ' + msg);
      await p.$disconnect().catch(() => {});
    }
  }
  console.log('\n⚠️  Ninguna funcionó — la contraseña no coincide con Supabase.');
})();
