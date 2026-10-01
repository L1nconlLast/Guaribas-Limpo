(function () {
  const loginButton = document.getElementById('authButton');
  const modal = document.getElementById('authModal');
  const form = document.getElementById('authForm');
  const closeButton = document.getElementById('closeAuth');
  const status = document.getElementById('authStatus');
  const userLabel = document.getElementById('userLabel');
  const registerModal = document.getElementById('registerModal');
  const registerForm = document.getElementById('registerForm');
  const registerSubmit = document.getElementById('registerSubmit');
  const registerValidation = document.getElementById('registerValidation');
  const forgotModal = document.getElementById('forgotModal');
  const resetModal = document.getElementById('resetModal');
  const realtime = () => window.GuaribasRealtime?.client;
  if (!loginButton || !modal || !form) return;

  const show = visible => { modal.hidden = !visible; };
  const showRegister = visible => { registerModal.hidden = !visible; };
  const showForgot = visible => { forgotModal.hidden = !visible; };
  const showReset = visible => { resetModal.hidden = !visible; };
  const setMessage = message => { status.textContent = message; };
  const friendlyAuthError = error => /rate limit|email rate limit/i.test(error?.message || '')
    ? 'Limite de e-mails atingido. Aguarde alguns minutos ou crie o usuário pelo painel do Supabase.'
    : (error?.message || 'Não foi possível concluir a operação.');

  function validateRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const valid = name.length >= 3 && validEmail && password.length >= 8 && password === confirm;
    registerSubmit.disabled = !valid;
    registerValidation.textContent = !name || name.length >= 3 ? '' : 'Informe seu nome completo.';
    if (name.length >= 3 && !validEmail && email) registerValidation.textContent = 'Informe um e-mail válido.';
    if (password && password.length < 8) registerValidation.textContent = 'A senha deve ter pelo menos 8 caracteres.';
    if (confirm && password !== confirm) registerValidation.textContent = 'As senhas não coincidem.';
    return valid;
  }

  function updateSession(session) {
    const user = session?.user;
    loginButton.textContent = user ? 'Sair' : 'Entrar';
    userLabel.textContent = user ? user.email : 'Modo demonstrativo';
    loginButton.dataset.logged = user ? 'true' : 'false';
    if (user) loadProfile(user);
  }

  async function loadProfile(user) {
    const client = realtime();
    if (!client) return;
    const { data } = await client.from('profiles').select('perfil,nome').eq('id', user.id).maybeSingle();
    if (data) userLabel.textContent = `${data.nome || user.email} · ${data.perfil}`;
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
  document.getElementById('openRegister').addEventListener('click', () => { show(false); showRegister(true); });
  document.getElementById('openForgot').addEventListener('click', () => { show(false); showForgot(true); });
  document.getElementById('closeRegister').addEventListener('click', () => showRegister(false));
  document.getElementById('backToLogin').addEventListener('click', () => { showRegister(false); show(true); });
  document.getElementById('closeForgot').addEventListener('click', () => showForgot(false));
  document.getElementById('backFromForgot').addEventListener('click', () => { showForgot(false); show(true); });
  forgotModal.addEventListener('click', event => { if (event.target === forgotModal) showForgot(false); });
  registerModal.addEventListener('click', event => { if (event.target === registerModal) showRegister(false); });
  registerForm.querySelectorAll('input').forEach(input => input.addEventListener('input', validateRegister));

  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateRegister()) return;
    const client = realtime();
    if (!client) return setMessage('Supabase ainda não está disponível.');
    registerSubmit.disabled = true;
    registerValidation.textContent = 'Criando conta...';
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await client.auth.signUp({ email, password, options: { data: { nome: name }, emailRedirectTo: redirectTo } });
    if (error) {
      registerSubmit.disabled = false;
      registerValidation.textContent = friendlyAuthError(error);
      return;
    }
    showRegister(false);
    show(true);
    setMessage('Conta criada. Verifique seu e-mail antes de entrar.');
    registerForm.reset();
  });

  document.getElementById('forgotForm').addEventListener('submit', async event => {
    event.preventDefault();
    const client = realtime();
    const email = document.getElementById('forgotEmail').value.trim();
    const message = document.getElementById('forgotStatus');
    if (!client) return message.textContent = 'Supabase ainda não está disponível.';
    message.textContent = 'Enviando link...';
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    message.textContent = error ? friendlyAuthError(error) : 'Link enviado. Confira seu e-mail.';
  });

  document.getElementById('resetForm').addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('newPassword').value;
    const confirmation = document.getElementById('confirmNewPassword').value;
    const message = document.getElementById('resetStatus');
    if (password.length < 8) return message.textContent = 'A senha deve ter pelo menos 8 caracteres.';
    if (password !== confirmation) return message.textContent = 'As senhas não coincidem.';
    const { error } = await realtime().auth.updateUser({ password });
    if (error) return message.textContent = friendlyAuthError(error);
    showReset(false);
    setMessage('Senha redefinida. Você já pode entrar.');
    show(true);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const client = realtime();
    if (!client) return setMessage('Supabase ainda não está disponível.');
    setMessage('Entrando...');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return setMessage(friendlyAuthError(error));
    setMessage('Sessão iniciada.');
    show(false);
  });

  const client = realtime();
  if (!client) return;
  client.auth.onAuthStateChange((event, session) => {
    updateSession(session);
    if (event === 'PASSWORD_RECOVERY') showReset(true);
  });
  client.auth.getSession().then(({ data }) => updateSession(data.session));
})();
