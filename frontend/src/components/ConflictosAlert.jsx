import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import fetchApi from '../services/api';

export default function ConflictosAlert({ userType }) {
  const navigate = useNavigate();
  const [conflictos, setConflictos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (userType === 'instructor') {
      loadConflictos();
    }
  }, [userType]);

  const loadConflictos = async () => {
    try {
      const data = await fetchApi('/horarios/conflictos');
      setConflictos(data.conflictos || []);
    } catch (err) {
      console.error('Error cargando conflictos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToHorario = () => {
    navigate('/instructor/horario');
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (loading || conflictos.length === 0 || dismissed || userType !== 'instructor') {
    return null;
  }

  return (
    <div className="card mb-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-bold text-red-900 dark:text-red-100">
              ⚠️ Tienes {conflictos.length} conflicto(s) de horario
            </h3>
            <button 
              onClick={handleDismiss}
              className="btn-icon text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
          
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            Los conflictos fueron generados por cambios del administrador. Debes resolver estos conflictos para evitar problemas en tu horario.
          </p>
          
          <div className="space-y-2 mb-3">
            {conflictos.map(c => (
              <div key={c.id} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-800 dark:text-red-200">
                  <Calendar size={14} />
                  <span>{c.dia}</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {c.descripcion}
                </p>
                {c.admin && (
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                    Generado por: {c.admin.fullName}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={handleGoToHorario}
            className="btn-primary bg-red-500 hover:bg-red-600 text-white w-full flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            Ir a Horario para Resolver
          </button>
        </div>
      </div>
    </div>
  );
}
