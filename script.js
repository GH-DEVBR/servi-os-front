const API = "https://exemplo-back.onrender.com";


document.addEventListener('DOMContentLoaded', () => {
  // 1) Toggle tema claro/escuro
  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // 2) Typed.js no Hero
  if (document.getElementById('typed-text')) {
    new Typed('#typed-text', {
      strings: ['Seu site em minutos.', 'Profissional e acessível.', 'Sem limites.'],
      typeSpeed: 50,
      backSpeed: 25,
      loop: true
    });
  }

  // 3) Fade-in ao scroll
  const faders = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('appear');
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  faders.forEach(f => obs.observe(f));

  // 4) Pagamento (pagamento.html)
  if (location.pathname.endsWith('pagamento.html')) {
    document.getElementById('pay-btn').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      if (!email) return Swal.fire('Atenção','Digite um e-mail válido','warning');
      try {
        Swal.fire({ title:'Redirecionando...', allowOutsideClick:false, didOpen:() => Swal.showLoading() });
        const res = await fetch(`${API}/criar-checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (!res.ok) {
          const txt = await res.text();
          return Swal.fire('Erro','Não foi possível iniciar o pagamento','error');
        }
        const url = await res.text();
        location.href = url;
      } catch (e) {
        Swal.fire('Erro inesperado', e.message, 'error');
      }
    });
  }

  // 5) Login (login.html)
  const lf = document.getElementById('login-form');
  if (lf) {
    lf.addEventListener('submit', async e => {
      e.preventDefault();
      const email = e.target.email.value, senha = e.target.senha.value;
      try {
        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });
        const token = await res.text();
        if (res.ok) {
          localStorage.setItem('token', token);
          location.href = 'painel.html';
        } else {
          Swal.fire('Erro ao logar', token, 'error');
        }
      } catch (e) {
        Swal.fire('Erro inesperado', e.message, 'error');
      }
    });
  }

  // 6) Painel (painel.html)
  if (location.pathname.endsWith('painel.html')) {
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      location.href = 'login.html';
    });
    carregarSites();
    document.getElementById('site-form').addEventListener('submit', async e => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) return Swal.fire('Erro','Faça login antes','warning');
      const data = {
        nome: e.target.nome.value,
        profissao: e.target.profissao.value,
        descricao: e.target.descricao.value,
        instagram: e.target.instagram.value,
        whatsapp: e.target.whatsapp.value,
        template: e.target.template.value
      };
      try {
        const res = await fetch(`${API}/gerar-site`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          const txt = await res.text();
          return Swal.fire('Erro','Não foi possível gerar o site','error');
        }
        const html = await res.text();
        window.open('', '_blank').document.write(html);
        carregarSites();
      } catch (e) {
        Swal.fire('Erro inesperado', e.message, 'error');
      }
    });
  }
});

// Função de carregar sites no painel
async function carregarSites() {
  const token = localStorage.getItem('token');
  const lista = document.getElementById('lista-sites');
  lista.innerHTML = '';
  try {
    const res = await fetch(`${API}/meus-sites`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) return lista.innerHTML = '<p>Erro ao carregar seus sites.</p>';
    const sites = await res.json();
    if (!sites.length) lista.innerHTML = '<p>Nenhum site criado ainda.</p>';
    else sites.forEach(s => {
      const div = document.createElement('div');
      div.className = 'site-card';
      div.innerHTML = `
        <strong>${s.nome}</strong> — ${s.profissao}<br>
        <p>${s.descricao}</p>
        <a href="${API}/site/${s.slug}" target="_blank">Ver site</a>
      `;
      lista.appendChild(div);
    });
  } catch {
    lista.innerHTML = '<p>Erro inesperado ao carregar.</p>';
  }
}








