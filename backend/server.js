const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory pseudo DB
const users = [];
const fichas = [];
const materias = [];
const asistencias = [];
const excusas = [];

// Función auxiliar para código aleatorio
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Rutas de Autenticación
app.post('/api/auth/register', (req, res) => {
  const { userType, fullName, document, email, password } = req.body;
  
  // Validations
  if (!userType || !fullName || !document || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const existingUser = users.find(u => u.email === email || u.document === document);
  if (existingUser) {
    return res.status(400).json({ error: 'El documento o correo ya está registrado' });
  }

  const newUser = {
    id: Date.now().toString(),
    userType,
    fullName,
    document,
    email,
    password // En producción se haría hash. Aquí no por alcance de MVP sin DB persistente
  };
  
  users.push(newUser);
  
  // Evitamos devolver la contraseña
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: 'Usuario registrado con éxito', user: userWithoutPassword });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Inicio de sesión exitoso', user: userWithoutPassword });
});

// Rutas de Fichas (RF04)
app.post('/api/fichas', (req, res) => {
  const { instructorId, numero, nivel, centro, jornada } = req.body;
  if (!instructorId || !numero) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const code = generateCode();
  const newFicha = {
    id: Date.now().toString(),
    numero,
    nivel,
    centro,
    jornada,
    code,
    instructorAdmin: instructorId,
    instructores: [instructorId],
    aprendices: [],
    createdAt: new Date()
  };

  fichas.push(newFicha);
  res.status(201).json({ message: 'Ficha creada con éxito', ficha: newFicha });
});

app.get('/api/fichas/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const userFichas = fichas.filter(f => 
    user.userType === 'instructor' 
      ? f.instructores.includes(userId)
      : f.aprendices.includes(userId)
  );

  res.json({ fichas: userFichas });
});

app.post('/api/fichas/join', (req, res) => {
  const { userId, code } = req.body;
  const user = users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const ficha = fichas.find(f => f.code === code);
  if (!ficha) return res.status(404).json({ error: 'Código de invitación inválido' });

  if (user.userType === 'aprendiz' && ficha.aprendices.includes(userId)) {
    return res.status(400).json({ error: 'Ya estás en esta ficha' });
  }
  
  // RF65: Restricción para aprendiz (solo 1 ficha)
  if (user.userType === 'aprendiz') {
    const isAlreadyInOtherFicha = fichas.some(f => f.aprendices.includes(userId));
    if (isAlreadyInOtherFicha) return res.status(400).json({ error: 'Un aprendiz solo puede unirse a una ficha.'});
    ficha.aprendices.push(userId);
  } else {
    // Es instructor
    if (ficha.instructores.includes(userId)) return res.status(400).json({ error: 'Ya estás en esta ficha como instructor.'});
    ficha.instructores.push(userId);
  }

  res.json({ message: 'Te has unido a la ficha exitosamente', ficha });
});

// Rutas de Materias (RF06)
app.post('/api/materias', (req, res) => {
  const { fichaId, nombre, tipo, instructorId } = req.body;
  if (!fichaId || !nombre) return res.status(400).json({ error: 'Faltan datos' });

  const newMateria = {
    id: Date.now().toString(),
    fichaId,
    nombre,
    tipo: tipo || 'Técnica',
    instructorId,
    sesiones: []
  };

  materias.push(newMateria);
  res.status(201).json({ message: 'Materia creada', materia: newMateria });
});

app.get('/api/materias/ficha/:fichaId', (req, res) => {
  const { fichaId } = req.params;
  const fichaMaterias = materias.filter(m => m.fichaId === fichaId);
  res.json({ materias: fichaMaterias });
});

// Utilidad para obtener materias de un usuario sin importar la ficha
app.get('/api/materias/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (user.userType === 'instructor') {
    const misMaterias = materias.filter(m => m.instructorId === userId);
    return res.json({ materias: misMaterias });
  } else {
    // Aprendiz: ver materias de SU ficha
    const miFicha = fichas.find(f => f.aprendices.includes(userId));
    if (!miFicha) return res.json({ materias: [] });
    
    const misMaterias = materias.filter(m => m.fichaId === miFicha.id);
    return res.json({ materias: misMaterias });
  }
});

// Rutas de Asistencia
app.post('/api/asistencias', (req, res) => {
  const { materiaId, fecha, instructorId } = req.body;
  if (!materiaId || !fecha) return res.status(400).json({ error: 'Faltan datos' });
  
  const newAsistencia = {
    id: Date.now().toString(),
    materiaId,
    fecha,
    instructorId,
    registros: []
  };
  asistencias.push(newAsistencia);
  res.status(201).json({ message: 'Sesión creada', asistencia: newAsistencia });
});

app.get('/api/asistencias/materia/:materiaId', (req, res) => {
  const { materiaId } = req.params;
  const list = asistencias.filter(a => a.materiaId === materiaId);
  res.json({ asistencias: list });
});

app.post('/api/asistencias/registrar', (req, res) => {
  const { asistenciaId, aprendizId, presente } = req.body;
  const asistencia = asistencias.find(a => a.id === asistenciaId);
  if (!asistencia) return res.status(404).json({ error: 'No se encontró la sesión' });
  
  const idx = asistencia.registros.findIndex(r => r.aprendizId === aprendizId);
  if (idx !== -1) {
    asistencia.registros[idx].presente = presente;
  } else {
    asistencia.registros.push({ aprendizId, presente });
  }
  res.json({ message: 'Asistencia registrada' });
});

// Rutas de Excusas
app.post('/api/excusas', (req, res) => {
  const { aprendizId, tipo, descripcion, fecha } = req.body;
  if (!aprendizId || !tipo || !descripcion) return res.status(400).json({ error: 'Faltan datos' });

  const newExcusa = {
    id: Date.now().toString(),
    aprendizId,
    tipo,
    descripcion,
    fecha: fecha || new Date().toISOString().split('T')[0],
    estado: 'Pendiente',
    createdAt: new Date()
  };
  excusas.push(newExcusa);
  res.status(201).json({ message: 'Excusa enviada', excusa: newExcusa });
});

app.get('/api/excusas/user/:userId', (req, res) => {
  const { userId } = req.params;
  const list = excusas.filter(e => e.aprendizId === userId);
  res.json({ excusas: list });
});

app.get('/api/excusas', (req, res) => {
  res.json({ excusas });
});

app.put('/api/excusas/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const excusa = excusas.find(e => e.id === id);
  if (!excusa) return res.status(404).json({ error: 'Excusa no encontrada' });
  
  excusa.estado = estado;
  res.json({ message: `Excusa marcada como ${estado}`, excusa });
});

app.listen(PORT, () => {
  console.log(`Backend de Arachiz ejecutándose en http://localhost:${PORT}`);
});
