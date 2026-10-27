# Atualização do site Vitor & Yasmin

## Como aplicar

Este pacote contém os arquivos alterados e adicionados. Ele deve ser aplicado no projeto existente `site-namorada`, que já contém as fotos originais, músicas e o package.json.

1. Faça uma cópia do seu projeto atual.
2. Extraia este ZIP.
3. Copie as pastas `src` e `public` extraídas para a raiz do projeto existente, juntando as pastas e aceitando substituir os arquivos correspondentes. Não exclua as fotos e músicas originais.
4. Na pasta do projeto, execute:

```bash
npm ci
npm run dev
```

5. Confira o resultado em http://localhost:3000. Para validar antes do deploy:

```bash
npm run lint
npm run build
```

6. Envie as mudanças ao seu GitHub e faça o deploy pelo fluxo da Vercel que você já usa.

## O que mudou

- Fundo preto com estrelas e detalhes em azul, inclusive quando o navegador está em tema claro.
- Abertura com os nomes de vocês e a foto do pedido em formato de fotografia impressa.
- Álbum com as nove fotos, ampliação sem recorte no visualizador e navegação por botões e pelas setas do teclado.
- Quatro cartinhas “Abra quando…” com mensagens carinhosas editáveis.
- Sua carta principal preservada.
- Música original com controles de reprodução, aviso de erro e player flutuante.
- Contador por meses de calendário, no horário de Goiás.
- Lembrança do pedido em Corumbá com animação que pode ser revista.
- Suporte a Escape, foco nos modais e preferência por menos movimento.
- Título da aba, idioma português e ícone de coração personalizados.
- Cópias WebP das nove fotos: aproximadamente 1,5 MB no total. As originais permanecem no projeto.

## Onde personalizar

- `src/lib/story.ts`: fotos, legendas, cartinhas e datas.
- `src/app/page.tsx`: abertura, carta principal e textos das seções.
- `src/app/globals.css`: cores, estrelas, tamanhos e animações.

As novas cartinhas são sugestões de texto escritas para esta atualização. Você pode ajustá-las livremente para ficarem ainda mais com o seu jeito.

O início da história foi mantido em 26/06/2026, e o pedido em 19/09/2026. São marcos diferentes, conforme o site original.

## Validações concluídas

- Build de produção, TypeScript e ESLint.
- Sete verificações do contador, incluindo aniversário mensal/anual, virada da meia-noite no horário de Goiás e ano bissexto.
- Interface sem rolagem horizontal em 320, 390, 768 e 1440 pixels.
- Carregamento das nove fotos; abertura, navegação e fechamento do álbum.
- Abertura das quatro cartinhas; fechamento por Escape e ao clicar fora; retorno de foco.
- Reprodução e pausa da música.
- Animação do pedido e abertura direta quando a pessoa prefere menos movimento.
- Sem erros de execução no navegador durante os testes.

## Situação do GitHub

A leitura do repositório funcionou, mas a conexão recusou a criação da branch com HTTP 403 (Resource not accessible by integration). Esta atualização não foi enviada ao GitHub nem publicada na Vercel. O ZIP permite aplicar todos os arquivos diretamente; para envio automático, a conexão precisa ter permissão de escrita neste repositório.
