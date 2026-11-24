import { useLoaderData, useActionData } from "react-router";
import { db } from "~/lib/db";

const STAGES = [
  { key: 'prospecting', label: 'Prospección', color: 'bg-gray-100' },
  { key: 'qualification', label: 'Calificación', color: 'bg-blue-100' },
  { key: 'proposal', label: 'Propuesta', color: 'bg-yellow-100' },
  { key: 'negotiation', label: 'Negociación', color: 'bg-orange-100' },
  { key: 'closed-won', label: 'Ganado', color: 'bg-green-100' },
  { key: 'closed-lost', label: 'Perdido', color: 'bg-red-100' },
] as const;

export async function clientLoader() {
  const [deals, contacts, companies] = await Promise.all([
    db.deals.getAll(),
    db.contacts.getAll(),
    db.companies.getAll(),
  ]);

  const contactMap = new Map(contacts.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
  const companyMap = new Map(companies.map(c => [c.id, c.name]));

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = deals.filter(d => d.stage === stage.key);
    return acc;
  }, {} as Record<string, typeof deals>);

  return { dealsByStage, contactMap, companyMap };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const dealId = formData.get('dealId') as string;
  const newStage = formData.get('stage') as typeof STAGES[0]['key'];

  if (dealId && newStage) {
    await db.deals.update(dealId, { stage: newStage });
  }
  return null;
}

export default function DealsIndex() {
  const { dealsByStage, contactMap, companyMap } = useLoaderData<typeof clientLoader>();

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const stageTotals = STAGES.map(stage => {
    const deals = dealsByStage[stage.key] || [];
    const total = deals.reduce((sum, d) => sum + d.value, 0);
    return { stage: stage.key, count: deals.length, total };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus oportunidades en el embudo de ventas</p>
        </div>
        <a href="/deals/new" className="btn-primary">Nueva Oportunidad</a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Pipeline stages">
        {STAGES.map((stage) => {
          const deals = dealsByStage[stage.key] || [];
          const total = stageTotals.find(t => t.stage === stage.key);
          return (
            <div key={stage.key} className="min-w-[300px] max-w-[320px] flex-shrink-0" role="listitem" aria-label={`${stage.label}: ${deals.length} oportunidades`}>
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col ${stage.color}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full text-gray-600">{deals.length}</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full text-gray-600">{formatCurrency(total?.total || 0)}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[400px]" data-stage={stage.key}>
                  {deals.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm">Sin oportunidades</div>
                  ) : (
                    deals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} contactMap={contactMap} companyMap={companyMap} currentStage={stage.key} />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ deal, contactMap, companyMap, currentStage }: { deal: any; contactMap: Map<string, string>; companyMap: Map<string, string>; currentStage: string }) {
  const nextStage = STAGES[STAGES.findIndex(s => s.key === currentStage) + 1];
  const prevStage = STAGES[STAGES.findIndex(s => s.key === currentStage) - 1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/deals/${deal.id}`}>
      <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
      <p className="text-sm text-green-600 font-semibold mt-1">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deal.value)}</p>
      <div className="mt-2 space-y-1 text-xs text-gray-500">
        {deal.contactId && contactMap.get(deal.contactId) && (
          <p>👤 {contactMap.get(deal.contactId)}</p>
        )}
        {deal.companyId && companyMap.get(deal.companyId) && (
          <p>🏢 {companyMap.get(deal.companyId)}</p>
        )}
        <p>📅 Cierre: {new Date(deal.expectedCloseDate).toLocaleDateString('es-ES')}</p>
        <p>Prob: {deal.probability}%</p>
      </div>
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">ID: {deal.id.slice(0, 8)}</span>
        <div className="flex space-x-1">
          {prevStage && (
            <form method="post" action="/deals">
              <input type="hidden" name="dealId" value={deal.id} />
              <input type="hidden" name="stage" value={prevStage.key} />
              <button type="submit" className="p-1 text-gray-400 hover:text-gray-600" title="Mover atrás">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </form>
          )}
          {nextStage && nextStage.key !== 'closed-lost' && (
            <form method="post" action="/deals">
              <input type="hidden" name="dealId" value={deal.id} />
              <input type="hidden" name="stage" value={nextStage.key} />
              <button type="submit" className="p-1 text-blue-500 hover:text-blue-700" title="Avanzar">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </form>
          )}
          {currentStage !== 'closed-won' && currentStage !== 'closed-lost' && (
            <form method="post" action="/deals">
              <input type="hidden" name="dealId" value={deal.id} />
              <input type="hidden" name="stage" value="closed-won" />
              <button type="submit" className="p-1 text-green-500 hover:text-green-700" title="Marcar como ganado">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </form>
          )}
          {currentStage !== 'closed-won' && currentStage !== 'closed-lost' && (
            <form method="post" action="/deals">
              <input type="hidden" name="dealId" value={deal.id} />
              <input type="hidden" name="stage" value="closed-lost" />
              <button type="submit" className="p-1 text-red-500 hover:text-red-700" title="Marcar como perdido">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}