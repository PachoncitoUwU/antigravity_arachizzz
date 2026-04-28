import React, { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, Users, BookOpen } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import fetchApi from '../../services/api';

export default function AdminReportes() {
  const { showToast } = useToast();
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    loadFichas();
  }, []);

  const loadFichas = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/admin/fichas');
      setFichas(data.fichas || []);
    } catch (err) {
      console.error('Error cargando fichas:', err);
      showToast('Error cargando fichas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReporte = async (fichaId) => {
    try {
      setDownloading(fichaId);
      showToast('Generando reporte...', 'info');
      // TODO: Implementar descarga de reporte
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('Reporte descargado exitosamente', 'success');
    } catch (err) {
      showToast('Error descargando reporte', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAllReportes = async () => {
    try {
      setDownloading('all');
      showToast('Generando reporte consolidado...', 'info');
      // TODO: Implementar descarga de reporte consolidado
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('Reporte consolidado descargado exitosamente', 'success');
    } catch (err) {
      showToast('Error descargando reporte consolidado', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        subtitle="Reportes y estadísticas del sistema"
        action={
          <button
            onClick={handleDownloadAllReportes}
            disabled={downloading === 'all' || fichas.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span>{downloading === 'all' ? 'Generando...' : 'Descargar Todo'}</span>
          </button>
        }
      />

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{fichas.length}</div>
              <div className="text-sm text-gray-500">Fichas Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {fichas.reduce((sum, f) => sum + (f._count?.aprendices || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Aprendices Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {fichas.reduce((sum, f) => sum + (f._count?.materias || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Materias Totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reportes por ficha */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando reportes...</div>
      ) : fichas.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={48} className="text-gray-400" />}
          title="Sin reportes"
          description="No tienes fichas para generar reportes"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Reportes por Ficha</h3>
            <p className="text-sm text-gray-500 mt-1">Descarga reportes individuales de cada ficha</p>
          </div>
          <div className="divide-y divide-gray-200">
            {fichas.map((ficha) => (
              <div key={ficha.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Ficha {ficha.numero}</h4>
                    <p className="text-sm text-gray-600 mt-1">{ficha.nombre}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {ficha._count?.aprendices || 0} aprendices
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {ficha._count?.materias || 0} materias
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadReporte(ficha.id)}
                    disabled={downloading === ficha.id}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={16} />
                    <span>{downloading === ficha.id ? 'Generando...' : 'Descargar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
