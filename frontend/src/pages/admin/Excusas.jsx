import React from 'react';
import { FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminExcusas() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Excusas"
        subtitle="Gestión de excusas de todas las fichas"
      />

      <EmptyState
        icon={<FileText size={48} className="text-gray-400" />}
        title="Próximamente"
        description="La gestión de excusas estará disponible pronto"
      />
    </div>
  );
}
