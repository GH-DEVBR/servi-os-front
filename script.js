document.getElementById("site-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado para gerar o site.");
    return;
  }

  const data = {
    nome: e.target.nome.value,
    profissao: e.target.profissao.value,
    descricao: e.target.descricao.value,
    instagram: e.target.instagram.value,
    whatsapp: e.target.whatsapp.value,
    email: prompt("Informe seu e-mail para vincular ao painel:"),
    template: e.target.template.value
  };

  const resposta = await fetch("http://localhost:8080/gerar-site", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(data)
  });

  if (!resposta.ok) {
    alert("Erro ao gerar site");
    return;
  }

  const htmlGerado = await resposta.text();
  const novaJanela = window.open("", "_blank");
  novaJanela.document.write(htmlGerado);
});

