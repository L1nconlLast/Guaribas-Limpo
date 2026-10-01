(function () {
  const modal = document.getElementById('occurrenceModal');
  const form = document.getElementById('occurrenceForm');
  if (!modal || !form) return;

  document.getElementById('newInspection').addEventListener('click', () => { modal.hidden = false; });
  document.getElementById('closeOccurrence').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', event => { if (event.target === modal) modal.hidden = true; });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.getElementById('occurrenceStatus');
    const client = window.GuaribasRealtime?.client;
    const sessionResult = client ? await client.auth.getSession() : { data: { session: null } };
    const session = sessionResult.data.session;
    if (!session) { status.textContent = 'Entre na sua conta antes de registrar uma ocorrência.'; return; }

    const type = document.getElementById('occurrenceType').value;
    const description = document.getElementById('occurrenceDescription').value.trim();
    const lat = Number(document.getElementById('occurrenceLat').value);
    const lng = Number(document.getElementById('occurrenceLng').value);
    const { data, error } = await client.from('ocorrencias').insert({
      tipo: type,
      descricao: description,
      geom: `POINT(${lng} ${lat})`,
      created_by: session.user.id
    }).select('id,tipo').single();
    if (error) { status.textContent = `Não foi possível salvar: ${error.message}`; return; }

    const incident = { id: data.id, type: data.tipo, lat, lng };
    incidents.push(incident);
    const marker = L.circleMarker([lat, lng], { radius: 9, color: '#fff', fillColor: '#c94a45', fillOpacity: .95 })
      .bindPopup(`<b>${type}</b><br>${description}`)
      .addTo(layers.incidents);
    marker.openPopup();
    refresh();
    form.reset();
    modal.hidden = true;
  });

  window.addEventListener('guaribas:occurrence', event => {
    const item = event.detail.new;
    if (!item || incidents.some(incident => incident.id === item.id)) return;
    const point = typeof item.geom === 'string' ? item.geom.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/) : null;
    const [lng, lat] = point ? [Number(point[1]), Number(point[2])] : (item.geom?.coordinates || []);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    incidents.push({ id: item.id, type: item.tipo || 'Ocorrência', lat, lng });
    L.circleMarker([lat, lng], { radius: 9, color: '#fff', fillColor: '#c94a45', fillOpacity: .95 })
      .bindPopup(`<b>${item.tipo || 'Ocorrência'}</b><br>${item.descricao || ''}`).addTo(layers.incidents);
    refresh();
  });
})();
