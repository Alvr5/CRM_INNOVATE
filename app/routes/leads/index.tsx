import { useLoaderData, useActionData } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";
import { Link } from "react-router";

const LEAD_STAGES = [
  { key: 'new', label: 'Nuevos', color: 'bg-gray-100' },
  { key: 'contacted', label: 'Contactados', color: 'bg-blue-100' },
  { key: 'qualified', label: 'Calificados', color: 'bg-yellow-100' },
  { key: 'unqualified', label: 'No Calificados', color: 'bg-orange-100' },
  { key: 'converted', label: 'Convertidos', color: 'bg-green-100' },
  { key: 'lost', label: 'Perdidos', color: 'bg-red-100' },
] as const;

export async function clientLoader() {
  const [leads, users] = await Promise.all([
    db.leads.getAll(),
    db.users.getAll(),
  ]);

  const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

  const leadsByStage = LEAD_STAGES.reduce((acc, stage) => {
    acc[stage.key] = leads.filter(l => l.status === stage.key);
    return acc;
  }, {} as Record<string, typeof leads>);

  return { leadsByStage, userMap };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const leadId = formData.get('leadId') as string;
  const newStatus = formData.get('status') as typeof LEAD_STAGES[0]['key'];

  if (leadId && newStatus) {
    db.leads.update(leadId, { status: newStatus });
  }
  return null;
}

export default function LeadsIndex() {
  const { leadsByStage, userMap } = useLoaderData<typeof clientLoader>();
  const [showConvertModal, setShowConvertModal] = useState<{ leadId: string; lead: any } | null>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const sourceLabels: Record<string, string> = {
    website: 'Web',
    referral: 'Referido',
    social: 'Redes Sociales',
    email: 'Email',
    phone: 'Teléfono',
    event: 'Evento',
    other: 'Otro',
  };

  const sourceColors: Record<string, string> = {
    website: 'bg-blue-100 text-blue-700',
    referral: 'bg-green-100 text-green-700',
    social: 'bg-purple-100 text-purple-700',
    email: 'bg-yellow-100 text-yellow-700',
    phone: 'bg-orange-100 text-orange-700',
    event: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    unqualified: 'No Calificado',
    converted: 'Convertido',
    lost: 'Perdido',
  };

  const handleConvert = (lead: any) => {
    setShowConvertModal({ leadId: lead.id, lead });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Gestiona tus oportunidades de venta desde el primer contacto</p>
        </div>
        <Link to="/leads/new" className="btn-primary">Nuevo Lead</Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Lead pipeline stages">
        {LEAD_STAGES.map((stage) => {
          const leads = leadsByStage[stage.key] || [];
          return (
            <div key={stage.key} className="min-w-[300px] max-w-[320px] flex-shrink-0" role="listitem" aria-label={`${stage.label}: ${leads.length} leads`}>
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col ${stage.color}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full text-gray-600">{leads.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[500px]" data-stage={stage.key}>
                  {leads.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm">Sin leads</div>
                  ) : (
                    leads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        userMap={userMap}
                        currentStage={stage.key}
                        onConvert={handleConvert}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showConvertModal && (
        <ConvertLeadModal
          lead={showConvertModal.lead}
          onClose={() => setShowConvertModal(null)}
          onConvert={() => setShowConvertModal(null)}
        />
      )}
    </div>
  );
}

function LeadCard({ lead, userMap, currentStage, onConvert }: { lead: any; userMap: Map<string, string>; currentStage: string; onConvert: (lead: any) => void }) {
  const nextStage = LEAD_STAGES[LEAD_STAGES.findIndex(s => s.key === currentStage) + 1];
  const prevStage = LEAD_STAGES[LEAD_STAGES.findIndex(s => s.key === currentStage) - 1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/leads/${lead.id}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{lead.firstName} {lead.lastName}</h4>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getScoreColor(lead.score)}`}>
          {lead.score}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2">{lead.company || 'Sin empresa'}</p>
      <p className="text-xs text-gray-400 mb-2">{lead.position}</p>
      <p className="text-sm text-green-600 font-semibold mb-2">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(lead.estimatedValue)}</p>
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSourceColor(lead.source)}`}>
          {getSourceLabel(lead.source)}
        </span>
        {lead.assignedTo && userMap.get(lead.assignedTo) && (
          <span className="text-xs text-gray-500">{userMap.get(lead.assignedTo)}</span>
        )}
      </div>
      <div className="flex space-x-1">
        {prevStage && (
          <form method="post" action="/leads">
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="status" value={prevStage.key} />
            <button type="submit" className="p-1 text-gray-400 hover:text-gray-600" title="Mover atrás">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          </form>
        )}
        {nextStage && nextStage.key !== 'lost' && (
          <form method="post" action="/leads">
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="status" value={nextStage.key} />
            <button type="submit" className="p-1 text-blue-500 hover:text-blue-700" title="Avanzar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </form>
        )}
        {currentStage !== 'converted' && currentStage !== 'lost' && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConvert(lead); }}
            className="p-1 text-green-500 hover:text-green-700" title="Convertir"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        )}
        {currentStage !== 'converted' && currentStage !== 'lost' && (
          <form method="post" action="/leads">
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="status" value="lost" />
            <button type="submit" className="p-1 text-red-500 hover:text-red-700" title="Marcar como perdido">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  if (score >= 40) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    website: 'Web',
    referral: 'Referido',
    social: 'Redes Sociales',
    email: 'Email',
    phone: 'Teléfono',
    event: 'Evento',
    other: 'Otro',
  };
  return labels[source] || source;
}

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    website: 'bg-blue-100 text-blue-700',
    referral: 'bg-green-100 text-green-700',
    social: 'bg-purple-100 text-purple-700',
    email: 'bg-yellow-100 text-yellow-700',
    phone: 'bg-orange-100 text-orange-700',
    event: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[source] || 'bg-gray-100 text-gray-700';
}

function ConvertLeadModal({ lead, onClose, onConvert }: { lead: any; onClose: () => void; onConvert: () => void }) {
  const [createContact, setCreateContact] = useState(true);
  const [createDeal, setCreateDeal] = useState(true);
  const [dealValue, setDealValue] = useState(lead.estimatedValue);
  const [dealTitle, setDealTitle] = useState(`${lead.firstName} ${lead.lastName} - ${lead.company || 'Sin empresa'}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.leads.update(lead.id, { status: 'converted', convertedAt: new Date().toISOString() });
    if (createContact) {
      const contact = db.contacts.create({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        companyId: undefined,
        position: lead.position,
        address: lead.address,
        city: lead.city,
        country: lead.country,
        notes: `Convertido desde lead: ${lead.notes}`,
      });
      db.leads.update(lead.id, { convertedToContactId: contact.id });
      if (createDeal) {
        const deal = db.deals.create({
          title: dealTitle,
          value: dealValue,
          stage: 'qualification',
          probability: 25,
          contactId: contact.id,
          companyId: undefined,
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: `Oportunidad creada al convertir lead: ${lead.notes}`,
        });
        db.leads.update(lead.id, { convertedToDealId: deal.id });
      }
    }
    onConvert();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Convertir Lead</h3>
        <p className="text-gray-600 mb-6">¿Qué deseas crear al convertir a <strong>{lead.firstName} {lead.lastName}</strong>?</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <input type="checkbox" id="createContact" checked={createContact} onChange={(e) => setCreateContact(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="createContact" className="ml-2 block text-sm text-gray-700">Crear Contacto</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="createDeal" checked={createDeal} onChange={(e) => setCreateDeal(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" disabled={!createContact} />
            <label htmlFor="createDeal" className="ml-2 block text-sm text-gray-700">Crear Oportunidad</label>
          </div>
          {createDeal && (
            <div className="space-y-3 pl-6 border-l-2 border-gray-200">
              <div>
                <label htmlFor="dealTitle" className="block text-sm font-medium text-gray-700">Título de la Oportunidad</label>
                <input type="text" id="dealTitle" value={dealTitle} onChange={(e) => setDealTitle(e.target.value)} className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="dealValue" className="block text-sm font-medium text-gray-700">Valor Estimado (€)</label>
                <input type="number" id="dealValue" value={dealValue} onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)} step="0.01" min="0" className="mt-1 input-field" />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Convertir</button>
          </div>
        </form>
      </div>
    </div>
  );
}