import React, { useState, useEffect } from 'react';
import fetchApi from '../../services/api';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Edit2, AlertTriangle, Search, Users, BookOpen } from 'lucide-react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const COLORES = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-700',   text: 'text-blue-800 dark:text-blue-300' },
  { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-700',  text: 'text-green-800 dark:text-green-300' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-300' },
  { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-300' },
  { bg: 'bg-red-50 dark:bg-red-900/20',    border: 'border-red-200 dark:border-red-700',    text: 'text-red-800 dark:text-red-300' },
  { bg: 'bg-pink-50 dark:bg-pink-900/20',   border: 'border-pink-200 dark:border-pink-700',   text: 'text-pink-800 dark:text-pink-300' },
];

const getColorForMateria = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % COLORES.length;
};

export default function AdminHorarios() {
  const { showToast } = useToast();
  
  // Estados principales
  const [viewMode, setViewMode] = useState('ficha'); // 'ficha' | 'instructor'
  const [loading, setLoading] = useState(false);
  
  // Estados para fichas
  const [fichas, setFichas] = useState([]);
  const [searchFicha, setSearchFicha] = useState('');
  const [selectedFicha, setSelectedFicha] = useState(null);
  
  // Estados para instructores
  const [instructores, setInstructores] = useState([]);
  const [searchInstructor, setSearchInstructor] = useState('');
  const [filterFichaId, setFilterFichaId] = useState('all');
  const [filterMateriaId, setFilterMateriaId] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  
  // Estados para horarios
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]); // Materias disponibles para agregar
  
  // Estados para edición
  const [modoEditar, setModoEditar] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [formEdit, setFormEdit] = useState({ id: '', dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00', materiaId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para conflictos
  const [conflictos, setConflictos] = useState([]);

  useEffect(() => {
    loadFichas();
    loadInstructores();
  }, []);

  const loadFichas = async () => {
    try {
      const data = await fetchApi('/admin/fichas');
      setFichas(data.fichas || []);
    } catch (err) {
      showToast(err.message || 'Error al cargar fichas', 'error');
    }
  };

  const loadInstructores = async () => {
    try {
      const data = await fetchApi('/admin/instructores');
      
      // Eliminar duplicados usando Map
      const instructoresMap = new Map();
      (data.instructores || []).forEach(item => {
        if (!instructoresMap.has(item.instructor.id)) {
          instructoresMap.set(item.instructor.id, {
            ...item.instructor,
            fichas: [item.ficha]
          });
        } else {
          const existing = instructoresMap.get(item.instructor.id);
          existing.fichas.push(item.ficha);
        }
      });
      
      setInstructores(Array.from(instructoresMap.values()));
    } catch (err) {
      showToast(err.message || 'Error al cargar instructores', 'error');
    }
  };

  const handleSelectFicha = async (ficha) => {
    setSelectedFicha(ficha);
    setSelectedInstructor(null);
    setModoEditar(false);
    setLoading(true);
    
    try {
      const data = await fetchApi(`/horarios/ficha/${ficha.id}`);
      setHorarios(data.horarios || []);
      
      // Cargar materias de la ficha para poder agregar
      const fichaDetalle = await fetchApi(`/admin/fichas/${ficha.id}`);
      setMaterias(fichaDetalle.ficha?.materias || []);
    } catch (err) {
      showToast(err.message || 'Error al cargar horario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstructor = async (instructor) => {
    setSelectedInstructor(instructor);
    setSelectedFicha(null);
    setModoEditar(false);
    setLoading(true);
    
    try {
      // Cargar horarios del instructor
      const horariosData = await fetchApi('/horarios/my-horarios');
      const horariosInstructor = horariosData.horarios.filter(h => h.materia?.instructorId === instructor.id);
      setHorarios(horariosInstructor);
      
      // Cargar materias del instructor para poder agregar
      const materiasData = await fetchApi('/materias/my-materias');
      const materiasInstructor = materiasData.materias.filter(m => m.instructorId === instructor.id);
      setMaterias(materiasInstructor);
      
      // Cargar conflictos del instructor
      const conflictosData = await fetchApi(`/admin/instructores/${instructor.id}/conflictos`);
      setConflictos(conflictosData.conflictos || []);
    } catch (err) {
      showToast(err.message || 'Error al cargar horario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (horario) => {
    if (!modoEditar) return;
    setFormEdit({
      id: horario.id,
      dia: horario.dia,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      materiaId: horario.materiaId
    });
    setModalEdit(true);
    setError('');
  };

  const handleUpdateHorario = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const response = await fetchApi(`/horarios/admin/${formEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          dia: formEdit.dia,
          horaInicio: formEdit.horaInicio,
          horaFin: formEdit.horaFin
        })
      });
      
      setHorarios(prev => prev.map(h => h.id === formEdit.id ? response.horario : h));
      setModalEdit(false);
      
      if (response.conflictos) {
        showToast(`Horario actualizado. ${response.conflictos.message}`, 'warning');
        // Recargar conflictos si estamos viendo un instructor
        if (selectedInstructor) {
          const conflictosData = await fetchApi(`/admin/instructores/${selectedInstructor.id}/conflictos`);
          setConflictos(conflictosData.conflictos || []);
        }
      } else {
        showToast('Horario actualizado', 'success');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtrar fichas
  const filteredFichas = fichas.filter(f => {
    if (!searchFicha) return true;
    const query = searchFicha.toLowerCase();
    return f.numero.toString().includes(query) || f.nombre?.toLowerCase().includes(query);
  });

  // Filtrar instructores
  const filteredInstructores = instructores.filter(i => {
    // Filtro de búsqueda por nombre
    if (searchInstructor) {
      const query = searchInstructor.toLowerCase();
      if (!i.fullName?.toLowerCase().includes(query)) return false;
    }
    
    // Filtro por ficha
    if (filterFichaId !== 'all') {
      if (!i.fichas.some(f => f.id === filterFichaId)) return false;
    }
    
    // Filtro por materia
    if (filterMateriaId !== 'all') {
      // Necesitaríamos cargar las materias del instructor para este filtro
      // Por ahora lo dejamos como placeholder
    }
    
    return true;
  });

  // Agrupar horarios por día
  const horariosPorDia = DIAS.map(dia => ({
    dia,
    clases: horarios.filter(h => h.dia === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Horarios"
        subtitle={
          modoEditar 
            ? "Haz click en una clase para editar sus horas" 
            : "Consulta y edita los horarios de fichas e instructores"
        }
      />

      {/* Toggle entre Ficha e Instructor */}
      <div className="card mb-5">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('ficha');
              setSelectedFicha(null);
              setSelectedInstructor(null);
              setHorarios([]);
              setModoEditar(false);
            }}
            className={`btn-secondary flex-1 flex items-center justify-center gap-2 ${
              viewMode === 'ficha' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700' : ''
            }`}
          >
            <Users size={16} />
            Ver por Ficha
          </button>
          <button
            onClick={() => {
              setViewMode('instructor');
              setSelectedFicha(null);
              setSelectedInstructor(null);
              setHorarios([]);
              setModoEditar(false);
            }}
            className={`btn-secondary flex-1 flex items-center justify-center gap-2 ${
              viewMode === 'instructor' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700' : ''
            }`}
          >
            <BookOpen size={16} />
            Ver por Instructor
          </button>
        </div>
      </div>

      {/* Sección de búsqueda y filtros */}
      {viewMode === 'ficha' ? (
        <div className="card mb-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Search size={16} />
            Buscar Ficha
          </h3>
          <input
            type="text"
            placeholder="Buscar por número o nombre de ficha..."
            value={searchFicha}
            onChange={(e) => setSearchFicha(e.target.value)}
            className="input-field"
          />
        </div>
      ) : (
        <div className="card mb-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Search size={16} />
            Buscar Instructor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchInstructor}
              onChange={(e) => setSearchInstructor(e.target.value)}
              className="input-field"
            />
            <select
              value={filterFichaId}
              onChange={(e) => setFilterFichaId(e.target.value)}
              className="input-field"
            >
              <option value="all">Todas las fichas</option>
              {fichas.map(f => (
                <option key={f.id} value={f.id}>Ficha {f.numero} - {f.nombre}</option>
              ))}
            </select>
            <select
              value={filterMateriaId}
              onChange={(e) => setFilterMateriaId(e.target.value)}
              className="input-field"
            >
              <option value="all">Todas las materias</option>
              {/* TODO: Cargar materias únicas de todos los instructores */}
            </select>
          </div>
        </div>
      )}

      {/* Grid de fichas o instructores */}
      {!selectedFicha && !selectedInstructor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {viewMode === 'ficha' ? (
            filteredFichas.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={<Users size={32} />}
                  title="No se encontraron fichas"
                  description="No hay fichas que coincidan con tu búsqueda"
                />
              </div>
            ) : (
              filteredFichas.map((ficha, idx) => (
                <div
                  key={ficha.id}
                  onClick={() => handleSelectFicha(ficha)}
                  className="card cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                  style={{ borderTopWidth: 3, borderTopColor: '#EA4335' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Ficha {ficha.numero}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ficha.nombre}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {ficha.nivel} · {ficha.jornada}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {ficha._count?.instructores || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Instructores</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {ficha._count?.materias || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Materias</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {ficha._count?.aprendices || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Aprendices</p>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredInstructores.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={<BookOpen size={32} />}
                  title="No se encontraron instructores"
                  description="No hay instructores que coincidan con tu búsqueda"
                />
              </div>
            ) : (
              filteredInstructores.map((instructor) => (
                <div
                  key={instructor.id}
                  onClick={() => handleSelectInstructor(instructor)}
                  className="card cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                  style={{ borderTopWidth: 3, borderTopColor: '#4285F4' }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {instructor.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                        {instructor.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{instructor.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      Fichas ({instructor.fichas?.length || 0}):
                    </p>
                    {instructor.fichas?.slice(0, 2).map(f => (
                      <p key={f.id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        • Ficha {f.numero} - {f.nombre}
                      </p>
                    ))}
                    {instructor.fichas?.length > 2 && (
                      <p className="text-xs text-gray-400">
                        +{instructor.fichas.length - 2} más
                      </p>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Información de la selección actual */}
      {(selectedFicha || selectedInstructor) && (
        <>
          <div className="card mb-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {selectedFicha ? `Ficha ${selectedFicha.numero} - ${selectedFicha.nombre}` : selectedInstructor?.fullName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedFicha ? `${selectedFicha.nivel} · ${selectedFicha.jornada}` : selectedInstructor?.email}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedFicha(null);
                    setSelectedInstructor(null);
                    setHorarios([]);
                    setModoEditar(false);
                    setConflictos([]);
                  }}
                  className="btn-secondary"
                >
                  Volver
                </button>
                {horarios.length > 0 && (
                  <button
                    onClick={() => setModoEditar(!modoEditar)}
                    className={`btn-secondary flex items-center gap-2 ${
                      modoEditar ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700' : ''
                    }`}
                  >
                    <Edit2 size={16} />
                    {modoEditar ? 'Salir de Edición' : 'Modo Editar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Alerta de conflictos */}
          {selectedInstructor && conflictos.length > 0 && (
            <div className="card mb-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
                    ⚠️ Este instructor tiene {conflictos.length} conflicto(s) de horario
                  </h3>
                  <div className="space-y-2">
                    {conflictos.map(c => (
                      <div key={c.id} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-800 dark:text-red-200">
                          <Calendar size={14} />
                          <span>{c.dia}</span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {c.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendario de horarios */}
          {loading ? (
            <div className="card animate-pulse">
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ) : horarios.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Calendar size={32} />}
                title="No hay horarios registrados"
                description={
                  selectedFicha 
                    ? "Esta ficha aún no tiene horarios asignados" 
                    : "Este instructor aún no tiene horarios asignados"
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {horariosPorDia.map(({ dia, clases }) => (
                <div key={dia} className="card dark:bg-gray-900 dark:border-gray-800 min-h-[160px]">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-7 h-7 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Calendar size={14} className="text-[#EA4335]" />
                    </div>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{dia}</span>
                    <span className="ml-auto badge badge-gray">{clases.length}</span>
                  </div>

                  {clases.length === 0 ? (
                    <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-400">Sin clases</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clases.map((c) => {
                        const color = COLORES[getColorForMateria(c.materiaId || c.materia?.id || c.materia?.nombre)];
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleOpenEdit(c)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              modoEditar ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-400' : ''
                            } ${color.bg} ${color.border}`}
                          >
                            <p className={`text-xs font-bold truncate ${color.text}`}>
                              {c.materia?.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> {c.horaInicio} – {c.horaFin}
                            </p>
                            {selectedFicha && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                {c.materia?.instructor?.fullName}
                              </p>
                            )}
                            {selectedInstructor && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                Ficha {c.materia?.ficha?.numero}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal para editar horario */}
      <Modal open={modalEdit} onClose={() => setModalEdit(false)} title="Editar Horario">
        <form onSubmit={handleUpdateHorario} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-1">
              Materia
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {horarios.find(h => h.id === formEdit.id)?.materia?.nombre}
            </p>
          </div>

          <div>
            <label className="input-label">Día</label>
            <select
              className="input-field"
              value={formEdit.dia}
              onChange={(e) => setFormEdit((p) => ({ ...p, dia: e.target.value }))}
            >
              {DIAS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Hora Inicio</label>
              <input
                type="time"
                required
                className="input-field"
                value={formEdit.horaInicio}
                onChange={(e) => setFormEdit((p) => ({ ...p, horaInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="input-label">Hora Fin</label>
              <input
                type="time"
                required
                className="input-field"
                value={formEdit.horaFin}
                onChange={(e) => setFormEdit((p) => ({ ...p, horaFin: e.target.value }))}
              />
            </div>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              ⚠️ Si este cambio genera conflictos de horario, se notificará al instructor para que los resuelva.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalEdit(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
