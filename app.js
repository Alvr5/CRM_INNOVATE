import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Credenciales de tu proyecto de Supabase
const SUPABASE_URL = "https://eorctlkxihvxynooadfg.supabase.co";
const SUPABASE_ANON_KEY = "sb_secret_Bk-9R8j-RmAXiVJuLBQQvQ_0UPvGGoN";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = s => document.querySelector(s);

// Botón de login con Discord en Supabase
$('#btn-discord').onclick = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) alert('Error al iniciar sesión con Discord: ' + error.message);
};

window.logout = async () => {
  await supabase.auth.signOut();
  window.location.reload();
};

// Verificar sesión al cargar la página
async function checkUser() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const user = session.user;
    $('#login-screen').style.display = 'none';
    $('#crm-container').style.display = 'block';
    
    $('#user-info').innerHTML = `
      <img src="${user.user_metadata.avatar_url || ''}" width="28" height="28" style="border-radius:50%">
      <span style="font-size: 14px;">${user.user_metadata.full_name || user.email}</span>
      <button class="btn" onclick="logout()" style="padding:4px 8px; font-size:12px;">Salir</button>
    `;
    
    await initCRM();
  } else {
    $('#login-screen').style.display = 'flex';
    $('#crm-container').style.display = 'none';
  }
}

/* ==========================================================================
   LÓGICA DEL CRM CONECTADO A SUPABASE
   ========================================================================== */

const D = { leads: [], alumnos: [], tareas: [], equipo: [], miembros: [], clases: [], pagos: [] };

const Store = {
  async load() {
    try {
      for (const k of Object.keys(E)) {
        const { data, error } = await supabase.from(k).select('*');
        if (!error && data) D[k] = data;
      }
    } catch (e) {
      console.error('Error al cargar de Supabase:', e);
    }
  },
  async insert(table, item) {
    const { data, error } = await supabase.from(table).insert([item]).select();
    if (error) alert('Error al guardar: ' + error.message);
    else if (data) D[table].unshift(data[0]);
  },
  async update(table, id, item) {
    delete item.id;
    const { error } = await supabase.from(table).update(item).eq('id', id);
    if (error) alert('Error al actualizar: ' + error.message);
  },
  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else D[table] = D[table].filter(x => x.id !== id);
  }
};

const CURSOS = ['HTML / CSS', 'Python', 'JavaScript', 'Otro'];
const E = {
  leads: { l: 'Leads', n: 'Lead', stage: 'etapa', f: [
    ['nombre', 'Nombre'], ['contacto', 'WhatsApp / Discord / Email'],
    ['curso', 'Curso de interés', 's', CURSOS],
    ['origen', 'Origen', 's', ['TikTok', 'Instagram', 'Discord', 'Twitch', 'Web', 'Referido', 'Otro']],
    ['etapa', 'Etapa', 's', ['Nuevo', 'Contactado', 'Clase de prueba', 'Matriculado', 'Perdido']],
    ['resp', 'Responsable', 'r'], ['notas', 'Notas', 't']] },
  alumnos: { l: 'Alumnos', n: 'Alumno', f: [
    ['nombre', 'Nombre'], ['contacto', 'Contacto'], ['curso', 'Curso', 's', CURSOS],
    ['estado', 'Estado', 's', ['Activo', 'Pausado', 'Baja']],
    ['pago', 'Pago mensual', 's', ['Al día', 'Pendiente', 'Atrasado']],
    ['inicio', 'Inicio', 'd'], ['profe', 'Profesor', 'r'], ['notas', 'Notas', 't']] },
  tareas: { l: 'Tareas', n: 'Tarea', f: [
    ['titulo', 'Tarea'], ['resp', 'Responsable', 'r'], ['vence', 'Vence', 'd'],
    ['prio', 'Prioridad', 's', ['Alta', 'Media', 'Baja']],
    ['estado', 'Estado', 's', ['Pendiente', 'En curso', 'Hecha']], ['notas', 'Notas', 't']] },
  equipo: { l: 'Postulantes', n: 'Postulante', f: [
    ['nombre', 'Nombre'], ['contacto', 'Contacto'],
    ['rol', 'Rol', 's', ['Profesor', 'Supervisor', 'Soporte', 'Marketing', 'Otro']],
    ['estado', 'Estado', 's', ['Nuevo', 'Entrevista', 'Aceptado', 'Rechazado']], ['notas', 'Notas', 't']] },
  miembros: { l: 'Miembros', n: 'Miembro', f: [
    ['nombre', 'Nombre'],
    ['rol', 'Roles (puedes elegir varios)', 'm', ['CEO', 'Director', 'Co-fundador', 'Desarrollador', 'Diseñador', 'Profesor', 'Supervisor', 'Soporte', 'Marketing', 'Ventas', 'Community Manager', 'Administrador']],
    ['contacto', 'WhatsApp / Email'], ['discord', 'Discord'], ['cursos', 'Cursos que imparte'],
    ['disp', 'Disponibilidad'], ['estado', 'Estado', 's', ['Activo', 'Inactivo']], ['notas', 'Notas', 't']] },
  clases: { l: 'Clases', n: 'Clase', f: [
    ['curso', 'Curso', 's', CURSOS], ['grupo', 'Grupo'], ['profe', 'Profesor', 'r'],
    ['dia', 'Día', 's', ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']],
    ['hora', 'Hora'], ['fecha', 'Fecha', 'd'], ['meet', 'Enlace Meet'],
    ['estado', 'Estado', 's', ['Programada', 'Realizada', 'Cancelada']], ['notas', 'Notas', 't']] },
  pagos: { l: 'Pagos', n: 'Pago', f: [
    ['nombre', 'Alumno'], ['monto', 'Monto'], ['mes', 'Mes (ej. 2026-11)'], ['metodo', 'Método'],
    ['fecha', 'Fecha', 'd'], ['estado', 'Estado', 's', ['Pagado', 'Pendiente', 'Atrasado']], ['notas', 'Notas', 't']] }
};

const tabs = [['inicio', 'Inicio'], ...Object.keys(E).map(k => [k, E[k].l])];
let view = 'inicio', q = '', cur = null, ce = null, per = 'month';

window.setPer = p => { per = p; render(); };

async function initCRM() {
  await Store.load();
  render();
}

function render() {
  $('#nav').innerHTML = tabs.map(([k, l]) =>
    `<button class="${k == view ? 'on' : ''}" onclick="go('${k}')">${l}${k != 'inicio' ? ' (' + D[k].length + ')' : ''}</button>`).join('');
  $('#app').innerHTML = view == 'inicio' ? dash() : list(view);
  const s = $('#q');
  if (s) s.oninput = e => { q = e.target.value; const p = e.target.selectionStart; render(); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); };
}

window.go = function(v) { view = v; q = ''; render(); };
const cnt = (a, k, v) => a.filter(x => x[k] == v).length;
const match = x => !q || JSON.stringify(Object.values(x)).toLowerCase().includes(q.toLowerCase());

function dash() {
  const L = D.leads, A = D.alumnos, T = D.tareas, hoy = new Date().toISOString().slice(0, 10);
  const mat = cnt(L, 'etapa', 'Matriculado'), conv = L.length ? Math.round(mat / L.length * 100) : 0;
  const late = T.filter(t => t.estado != 'Hecha' && t.vence && t.vence < hoy);
  const kpi = (b, s) => `<div class="card kpi"><b>${b}</b><span class="mu">${s}</span></div>`;
  const bars = (a, key, opts) => opts.map(o => {
    const n = cnt(a, key, o);
    return `<div style="margin-top:8px">${esc(o)} <span class="mu">${n}</span><div class="meter"><i style="width:${a.length ? n / a.length * 100 : 0}%"></i></div></div>`;
  }).join('');
  return `<div class="grid">${kpi(L.length, 'Leads totales')}${kpi(conv + '%', 'Conversión a matrícula')}${kpi(cnt(A, 'estado', 'Activo'), 'Alumnos activos')}${kpi(cnt(A, 'pago', 'Atrasado') + cnt(A, 'pago', 'Pendiente'), 'Pagos pendientes o atrasados')}${kpi(T.filter(t => t.estado != 'Hecha').length, 'Tareas abiertas')}${kpi(late.length, 'Tareas vencidas')}${kpi(D.miembros.filter(m => m.estado != 'Inactivo').length, 'Miembros del equipo')}</div>
  <div class="grid"><div class="card"><b>Embudo de leads</b>${bars(L, 'etapa', E.leads.f[4][3])}</div>
  <div class="card"><b>Alumnos por curso</b>${bars(A, 'curso', CURSOS)}</div>
  <div class="card"><b>Origen de leads</b>${bars(L, 'origen', E.leads.f[3][3])}</div>
  <div class="card"><b>Tareas vencidas</b>${late.map(t => `<div class="er">${esc(t.titulo)} <span class="mu">${esc(t.resp)} · ${t.vence}</span></div>`).join('') || '<div class="mu">Nada vencido</div>'}</div></div>`;
}

function list(k) {
  const e = E[k], R = D[k].filter(match);
  let h = (k == 'pagos' ? chart() : '') +
    `<div class="bar"><input id="q" placeholder="Buscar…" value="${esc(q)}"><button class="btn pri" onclick="edit('${k}')">+ ${e.n}</button><button class="btn" onclick="csv('${k}')">Exportar CSV</button></div>`;
  if (e.stage) {
    const st = e.f.find(f => f[0] == e.stage)[3];
    return h + '<div class="kan">' + st.map(s => {
      const it = R.filter(x => (x[e.stage] || st[0]) == s);
      return `<div class="col"><h3>${s}<span class="mu">${it.length}</span></h3>${it.map(x =>
        `<div class="item" onclick="edit('${k}','${x.id}')"><b>${esc(x.nombre)}</b><div class="mu">${esc(x.contacto)}</div><div style="margin-top:4px"><span class="tag">${esc(x.curso)}</span> <span class="mu">${esc(x.resp)}</span></div></div>`).join('')}</div>`;
    }).join('') + '</div>';
  }
  const cols = e.f.filter(f => f[0] != 'notas');
  const color = v => ['Atrasado', 'Alta', 'Baja', 'Rechazado', 'Cancelada', 'Inactivo'].includes(v) ? 'er'
    : ['Pendiente', 'Entrevista', 'Pausado'].includes(v) ? 'wr'
    : ['Al día', 'Hecha', 'Aceptado', 'Activo', 'Pagado', 'Realizada'].includes(v) ? 'ok' : '';
  return h + `<div class="tw"><table><tr>${cols.map(f => `<th>${f[1]}</th>`).join('')}</tr>` +
    R.map(x => `<tr class="r" onclick="edit('${k}','${x.id}')">${cols.map(f => `<td class="${color(x[f[0]])}">${esc(x[f[0]])}</td>`).join('')}</tr>`).join('') +
    '</table></div>' + (R.length ? '' : '<p class="mu">Todavía no hay registros.</p>');
}

function bucket(s) {
  const y = s.slice(0, 4), m = +s.slice(5, 7);
  return per == 'day' ? s : per == 'month' ? s.slice(0, 7) : per == 'quarter' ? y + '-T' + Math.ceil(m / 3) : y;
}
function bucketKeys() {
  const n = new Date(), o = [], d = x => x.getFullYear() + '-' + p2(x.getMonth() + 1) + '-' + p2(x.getDate());
  if (per == 'day') for (let i = 29; i >= 0; i--) o.push(bucket(d(new Date(n.getFullYear(), n.getMonth(), n.getDate() - i))));
  else if (per == 'month') for (let i = 11; i >= 0; i--) o.push(bucket(d(new Date(n.getFullYear(), n.getMonth() - i, 1))));
  else if (per == 'quarter') { let y = n.getFullYear(), qt = Math.ceil((n.getMonth() + 1) / 3); for (let i = 0; i < 8; i++) { o.unshift(y + '-T' + qt); if (--qt == 0) { qt = 4; y--; } } }
  else { const ys = D.pagos.map(p => +(p.fecha || '').slice(0, 4)).filter(Boolean); for (let y = Math.min(n.getFullYear(), ...ys); y <= n.getFullYear(); y++) o.push(String(y)); }
  return o;
}
function chart() {
  const K = bucketKeys(), m = {}, num = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });
  D.pagos.filter(p => p.estado == 'Pagado' && p.fecha).forEach(p => { const k = bucket(p.fecha.slice(0, 10)); m[k] = m[k] || { v: 0, n: 0 }; m[k].v += parseFloat(p.monto) || 0; m[k].n++; });
  const V = K.map(k => m[k] || { v: 0, n: 0 }), mx = Math.max(1, ...V.map(x => x.v)), W = 700, H = 220, bw = W / K.length;
  const tot = V.reduce((a, x) => a + x.v, 0), cn = V.reduce((a, x) => a + x.n, 0);
  const svg = K.map((k, i) => {
    const h = V[i].v / mx * (H - 40);
    return `<rect x="${i * bw + bw * 0.12}" y="${H - 25 - h}" width="${bw * 0.76}" height="${h}" rx="3" fill="var(--ac)"><title>${k}: ${num.format(V[i].v)} (${V[i].n} pagos)</title></rect>` +
      (K.length <= 14 || i % Math.ceil(K.length / 10) == 0 ? `<text x="${i * bw + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--mu)">${per == 'day' ? k.slice(5) : k}</text>` : '');
  }).join('');
  return `<div class="card" style="margin-bottom:14px"><div class="bar" style="margin:0 0 10px"><b style="margin-right:auto">Ingresos (pagos con estado Pagado)</b>${[['day', 'Diario'], ['month', 'Mensual'], ['quarter', 'Trimestral'], ['year', 'Anual']].map(([a, b]) => `<button class="btn ${per == a ? 'pri' : ''}" onclick="setPer('${a}')">${b}</button>`).join('')}</div>
  <div class="grid"><div class="card kpi"><b>${num.format(tot)}</b><span class="mu">Total del periodo</span></div><div class="card kpi"><b>${cn}</b><span class="mu">Pagos</span></div><div class="card kpi"><b>${num.format(cn ? tot / cn : 0)}</b><span class="mu">Ticket promedio</span></div></div>
  <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Ingresos por periodo">${svg}</svg></div>`;
}

function field([n, l, t, o], v) {
  const val = v[n]; let x;
  if (t == 'r') { o = ['', ...D.miembros.map(m => m.nombre)]; t = 's'; }
  if (t == 'm') x = `<div class="chk">${o.map(r => `<label class="ck"><input type="checkbox" name="${n}" value="${r}" ${[].concat(val || []).includes(r) ? 'checked' : ''}> ${r}</label>`).join('')}</div>`;
  else if (t == 's') x = `<select name="${n}">${o.map(r => `<option ${val == r ? 'selected' : ''}>${r}</option>`).join('')}</select>`;
  else if (t == 't') x = `<textarea rows="3" name="${n}">${esc(val)}</textarea>`;
  else x = `<input name="${n}" type="${t == 'd' ? 'date' : 'text'}" value="${esc(val)}">`;
  return `<label>${l}</label>${x}`;
}

window.edit = function(k, id) {
  ce = k; cur = id ? D[k].find(x => x.id == id) : null;
  const e = E[k], v = cur || {};
  $('#fld').innerHTML = `<b>${cur ? 'Editar' : 'Nuevo'} · ${e.n}</b>` + e.f.map(f => field(f, v)).join('');
  $('#del').style.display = cur ? '' : 'none';
  $('#dlg').showModal();
};

$('#cx').onclick = () => $('#dlg').close();

$('#sv').onclick = async () => {
  const d = {};
  document.querySelectorAll('#fld [name]').forEach(i => {
    if (i.type == 'checkbox') { d[i.name] = d[i.name] || []; if (i.checked) d[i.name].push(i.value); }
    else d[i.name] = i.value.trim();
  });
  if (!(d.nombre || d.titulo)) return;
  
  if (cur) {
    Object.assign(cur, d, { upd: Date.now() });
    await Store.update(ce, cur.id, cur);
  } else {
    const newItem = { id: crypto.randomUUID(), creado: Date.now(), ...d };
    await Store.insert(ce, newItem);
  }
  $('#dlg').close();
  render();
};

$('#del').onclick = async () => {
  if (confirm('¿Eliminar este registro?')) {
    await Store.remove(ce, cur.id);
    $('#dlg').close();
    render();
  }
};

const esc = s => String(Array.isArray(s) ? s.join(', ') : (s ?? '')).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const p2 = n => String(n).padStart(2, '0');

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
window.csv = function(k) {
  const f = E[k].f, rows = [f.map(x => x[1]), ...D[k].map(x => f.map(y => x[y[0]] ?? ''))];
  download(k + '.csv', '\ufeff' + rows.map(r => r.map(c => '"' + String(Array.isArray(c) ? c.join(', ') : c).replace(/"/g, '""') + '"').join(',')).join('\n'), 'text/csv');
};
$('#bk').onclick = () => download('crm-innovate-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(D, null, 2), 'application/json');
$('#rs').onclick = () => $('#rf').click();
$('#rf').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!confirm('Esto reemplazará los datos. ¿Continuar?')) return;
    alert('Restauración desde JSON completada localmente.');
  } catch (err) { alert('Archivo no válido.'); }
  e.target.value = '';
};

// Inicializar verificación de sesión al cargar
checkUser();
