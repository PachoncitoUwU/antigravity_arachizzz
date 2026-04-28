import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

export default function AdminPapelera() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadPapelera();
  }, []);

  const loadPapelera = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint de papelera
      // const data = await fetchApi('/admin/papelera');
      // setItems(data.items || []);
      
      // Datos de ejemplo
      setItems([
        {
          id: '1',
          tipo: 'aprendiz',
          nombre: 'Juan Pérez',
          ficha: 'Ficha 2558963',
          fechaEliminacion: '2026-04-20',
          eliminadoPor: 'Admin Principal'
        },
        {
          id: '2',
          tipo: 'materia',
          nombre: 'Matemáticas Avanzadas',
          ficha: 'Ficha 2558963',
          fechaEliminacion: '2026-04-18',
          eliminadoPor: 'Admin Principal'
        }
      ]);
    } catch (err) {
      console.error('Error cargando papelera:', err);
      showToast('Error cargando papelera', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      // TODO: Implementar restauración
      showToast(`${item.nombre} restaurado exitosamente`, 'success');
      setItems(items.filter(i => i.id !== item.id));
    } catch (err) {
      showToast('Error restaurando elemento', 'error');
    }
  };

  const handleDeletePermanently = async () => {
    if (!selectedItem) return;
    
    try {
      // TODO: Implementar eliminación permanente
      showToast(`${selectedItem.nombre} eliminado permanentemente`, 'success');
      setItems(items.filter(i => i.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      showToast('Error eliminando elemento', 'error');
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'aprendiz': return 'bg-green-100 text-green-600';
      case 'instructor': return 'bg-blue-100 text-blue-600';
      case 'materia': return 'bg-purple-100 text-purple-600';
      case 'ficha': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Papelera"
        subtitle="Elementos eliminados que pueden ser restaurados"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando papelera...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Trash2 size={48} className="text-gray-400" />}
          title="Papelera vacía"
          description="No hay elementos eliminados"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ficha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Eliminado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Por</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getTipoColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.ficha}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.fechaEliminacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.eliminadoPor}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="btn-icon text-green-600 hover:bg-green-50"
                          title="Restaurar"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteModal(true);
                          }}
                          className="btn-icon text-red-600 hover:bg-red-50"
                          title="Eliminar permanentemente"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación permanente */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar Permanentemente</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                ¿Estás seguro de que deseas eliminar permanentemente <strong>{selectedItem.nombre}</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                Esta acción eliminará todos los datos asociados y no podrá ser revertida.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePermanently}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
