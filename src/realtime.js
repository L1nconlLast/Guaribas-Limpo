(function () {
  const config = window.GUARIBAS_SUPABASE;
  if (!config?.url || !config?.anonKey || !window.supabase) return;

  const client = window.supabase.createClient(config.url, config.anonKey);
  const channel = client.channel('guaribas-live');
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ocorrencias' }, payload => window.dispatchEvent(new CustomEvent('guaribas:occurrence', { detail: payload })))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'domicilios' }, payload => window.dispatchEvent(new CustomEvent('guaribas:home', { detail: payload })))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitacoes' }, payload => window.dispatchEvent(new CustomEvent('guaribas:request', { detail: payload })))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'equipes' }, payload => window.dispatchEvent(new CustomEvent('guaribas:team', { detail: payload })))
    .subscribe();

  window.GuaribasRealtime = {
    client,
    watchTeamPosition(teamId) {
      if (!navigator.geolocation || !teamId) return () => {};
      const watchId = navigator.geolocation.watchPosition(async position => {
        await client.from('equipes').update({ geom: `POINT(${position.coords.longitude} ${position.coords.latitude})` }).eq('id', teamId);
      }, error => console.warn('Geolocalização indisponível:', error.message), { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  };
})();
