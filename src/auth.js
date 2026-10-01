(function () {
  const loginButton = document.getElementById('authButton');
  const modal = document.getElementById('authModal');
  const form = document.getElementById('authForm');
  const closeButton = document.getElementById('closeAuth');
  const status = document.getElementById('authStatus');
  const userLabel = document.getElementById('userLabel');
  const realtime = () => window.GuaribasRealtime?.client;
  if (!loginButton || !modal || !form) return;

  const show = visible => { modal.hidden = !visible; };
  const setMessage = message => { status.textContent = message; };

  function updateSession(session) {
    const user = session?.user;
    loginButton.textContent = user ? 'Sair' : 'Entrar';
    userLabel.textContent = user ? user.email : 'Modo demonstrativo';
    loginButton.dataset.logged = user ? 'true' : 'false';
  }

  loginButton.addEventListener('click', async () => {
    if (loginButton.dataset.logged === 'true') {
      await realtime()?.auth.signOut();
      return;
    }
    setMessage('');
    show(true);
  });
  closeButton.addEventListener('click', () => show(false));
  modal.addEventListener('click', event => { if (event.target === modal) show(false); });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const client = realtime();
    if (!client) return setMessage('Supabase ainda não está disponível.');
    setMessage('Entrando...');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return setMessage(error.message);
    setMessage('Sessão iniciada.');
    show(false);
  });

  const client = realtime();
  if (!client) return;
  client.auth.onAuthStateChange((_event, session) => updateSession(session));
  client.auth.getSession().then(({ data }) => updateSession(data.session));
})();
