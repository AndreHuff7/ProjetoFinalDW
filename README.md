ProjetoFinalDW — Painel MetalWatch

Descrição
- Painel front-end que simula preços de metais (ouro, carvão, esmeralda), histórico, metas pessoais e simulação de compras/vendas.

Como usar
1. Abra [ProjetoFinalDêDabiliu/index.html](ProjetoFinalDêDabiliu/index.html) no navegador.
2. Use o seletor de metal para alternar entre metais.
3. Clique em "Atualizar" ou aguarde as atualizações automáticas.
4. Botão "Histórico" mostra movimentos recentes; "Metas Pessoais" abre a simulação de carteira.

Arquivos principais
- ProjetoFinalDêDabiliu/index.html — interface.
- ProjetoFinalDêDabiliu/style.css — estilos.
- ProjetoFinalDêDabiliu/javascript.js — lógica (simulação, histórico, persistência via localStorage).

Notas técnicas
- Dados da carteira são salvos no `localStorage` sob a chave `metalwatch_portfolio`.
- O projeto é estático; basta abrir o `index.html` localmente.

O que é um PR (Pull Request)?
- Um PR é um pedido para mesclar (“pull”) suas alterações em um branch do repositório principal.
- Usado para revisar código: outras pessoas podem comentar, sugerir mudanças e aprovar antes da fusão.
- Fluxo comum: criar um branch, fazer commits, abrir o PR no GitHub apontando para `main` (ou outro branch), discutir e então mesclar.

Comandos Git úteis
```bash
# adicionar arquivos modificados
git add ProjetoFinalDêDabiliu/index.html ProjetoFinalDêDabiliu/style.css ProjetoFinalDêDabiliu/javascript.js
# criar commit
git commit -m "Add MetalWatch panel with UI, styles and portfolio modal"
# enviar para remoto
git push origin main
# criar um novo branch e abrir PR (local)
git checkout -b minha-feature
git push -u origin minha-feature
# depois abra o PR no GitHub apontando 'minha-feature' -> 'main'
```

Posso abrir um PR para você no GitHub (criar branch + abrir PR) se quiser; diga o nome do branch e a mensagem do PR.
