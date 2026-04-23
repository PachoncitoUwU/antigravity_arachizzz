const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Aplicando migración de MateriaEvitada...');
    
    // Verificar si la tabla ya existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'MateriaEvitada'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✓ La tabla MateriaEvitada ya existe');
    } else {
      // Crear la tabla
      await prisma.$executeRaw`
        CREATE TABLE "MateriaEvitada" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "aprendizId" TEXT NOT NULL,
          "materiaId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT "MateriaEvitada_aprendizId_fkey" 
            FOREIGN KEY ("aprendizId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          
          CONSTRAINT "MateriaEvitada_materiaId_fkey" 
            FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          
          CONSTRAINT "MateriaEvitada_aprendizId_materiaId_key" 
            UNIQUE ("aprendizId", "materiaId")
        );
      `;
      
      // Crear índices
      await prisma.$executeRaw`
        CREATE INDEX "MateriaEvitada_aprendizId_idx" ON "MateriaEvitada"("aprendizId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "MateriaEvitada_materiaId_idx" ON "MateriaEvitada"("materiaId");
      `;
      
      console.log('✓ Tabla MateriaEvitada creada exitosamente');
    }
    
    console.log('✓ Migración completada');
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
