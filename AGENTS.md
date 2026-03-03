# Agent Context & Instructions: Lynx Tailwind v4 Plugin

## 1. Visão Geral do Projeto

Este projeto é um plugin de build para o framework **Lynx**. O objetivo do plugin é integrar o **Tailwind CSS v4** ao processo de build do Lynx.
O build do Lynx é semelhante ao da Web, compilando os estilos e gerando um arquivo final `main.css`. No entanto, o Lynx possui restrições severas sobre quais propriedades CSS são suportadas, e o plugin deve atuar como uma ponte e um filtro entre o Tailwind v4 e o Lynx.

## 2. Stack Tecnológico

- **Target Framework:** Lynx (Cross-platform UI framework)
- **CSS Framework:** Tailwind CSS v4 (Oxide engine, Rust-based)
- **Linguagem do Plugin:** TypeScript / Node.js
- **Build Tool (real do projeto):** Rspeedy (baseado em **Rsbuild + Rspack**)
- **Processamento de CSS:** PostCSS / Lightning CSS (dependendo da integração do TW v4)

## 3. Regras Críticas para o Tailwind CSS v4

O Tailwind v4 mudou significativamente em relação ao v3. O Agente IA **DEVE** seguir estas regras:

- **NÃO use `tailwind.config.js`**. O Tailwind v4 é "CSS-first". Toda configuração é feita diretamente no arquivo CSS usando a diretiva `@theme`.
- **Importação:** A importação principal é feita via `@import "tailwindcss";` no arquivo CSS de entrada.
- **Variáveis nativas:** O Tailwind v4 usa CSS variables para tudo. O plugin precisará garantir que o Lynx consiga interpretar essas variáveis ou resolvê-las (inline) durante o build, caso o Lynx engine não suporte variáveis dinâmicas no contexto desejado.

## 4. Restrições e Regras de CSS do Lynx

O Lynx não é um navegador web tradicional (DOM). O Agente IA deve ter em mente as seguintes restrições ao processar ou gerar CSS:

- **Layout:** O Lynx usa Flexbox e (recentemente) Linear/Grid específicos. Propriedades web tradicionais como `float`, `display: block`, `display: inline` **não são suportadas** ou se comportam de maneira imprevisível.
- **Posicionamento:** `position: absolute` e `position: relative` são permitidos, mas `position: fixed` ou `sticky` podem ter restrições ou não existir.
- **Unidades:** Evitar unidades baseadas em viewport web estritas sem tratamento. Priorizar `px`, `rpx` (responsive pixels do Lynx), ou % quando aplicável. O plugin precisará converter unidades web clássicas (como `rem`) para unidades suportadas pelo Lynx (`rpx` ou `px` calculados).
- **Herança:** O Lynx tem suporte limitado à herança de CSS em cascata em comparação com a Web. Estilos de texto (cor, fonte) geralmente precisam ser aplicados diretamente no componente de texto.
- **Pseudo-classes:** Suporte limitado (ex: `:hover`, `:active` podem exigir tratamento específico ou não existir no mesmo formato da web).
- **Animações:** `@keyframes` e `transition` têm suporte estrito e limitado a propriedades de hardware (opacity, transform).

## 5. Arquitetura Esperada do Plugin

O Agente deve ajudar a construir o plugin seguindo este fluxo:

1. **Interceptação:** Capturar o arquivo CSS/Estilos de entrada do usuário.
2. **Processamento Tailwind:** Passar o CSS pelo motor do Tailwind v4 para gerar o CSS bruto com as classes utilitárias usadas (Purge/JIT nativo do v4).
3. **AST / Transformação (A Parte Mágica):** Usar PostCSS (ou AST similar) para varrer o CSS gerado pelo Tailwind e:
   - Remover classes e propriedades incompatíveis com o Lynx.
   - Converter variáveis de ambiente CSS (`var(--tw-...)`) em valores absolutos, se o Lynx exigir.
   - Converter unidades (ex: `1rem` -> `16px` ou `32rpx`).
4. **Emissão:** Gerar o arquivo `main.css` limpo, seguro e otimizado para o Lynx.

## 6. Diretrizes de Codificação para a IA

- Escreva código em TypeScript usando ESModules (`import`/`export`).
- Seja defensivo na manipulação de AST (Abstract Syntax Trees) para não quebrar o build com CSS malformado.
- Adicione comentários explicando _por que_ uma transformação específica está sendo feita (ex: `// Removendo display: block pois o Lynx apenas suporta flex/grid`).
- Sempre que sugerir a implementação de um filtro de CSS, crie listas de permissões (Allow-lists) em vez de listas de bloqueio (Block-lists), pois é mais seguro em ambientes restritos como o Lynx.
- Utilize testes unitários (Vitest/Jest) para garantir que o input do Tailwind gera exatamente o output esperado do Lynx.

## 7. Comandos de Inicialização (Exemplos para o Agente)

Quando você, Agente, for solicitado a implementar uma feature, assuma:

- Estamos construindo a ponte entre `CSS TW v4 -> Plugin Node.js -> main.css compatível com Lynx`.
- Se tiver dúvidas sobre se o Lynx suporta uma propriedade CSS que o Tailwind gerou, pergunte ao usuário antes de implementar a transformação.

## 8. Aprendizados Validados no Projeto

Estes pontos já foram observados na prática neste repositório e devem guiar as próximas implementações:

- **Integração no build:** o plugin foi integrado via `pluginLynxTailwind()` no `lynx.config.ts` (hook de `tools.postcss` do Rsbuild).
- **Tailwind no app de teste:** para Lynx, preferir no `App.css`:
  - `@import "tailwindcss/theme" layer(theme);`
  - `@import "tailwindcss/utilities" layer(utilities);`
  Isso evita `preflight` web que pode gerar problemas de parse (ex: seletores `:host,html`).
- **Cores do Tailwind v4:** o Tailwind gera muitas cores em `oklch(...)`. O Lynx pode não aplicar corretamente. O sanitizer deve converter `oklch` para `rgb/rgba`.
- **Variáveis CSS do Tailwind:** valores `var(--...)` precisam ser resolvidos/inline quando possível. Se a variável não puder ser resolvida, remover a declaração para evitar CSS inválido no runtime.
- **Unidades:** converter `rem` para unidade suportada (`rpx` por padrão). Fazer conversão também após inlining de variável (ex: `calc(var(--spacing) * 4)`).
- **Propriedades não suportadas observadas:** `text-transform` causou erro real de build no Lynx (`Error In CSSParse: "text-transform" is not supported now !`) e foi removida da allow-list.
- **Pseudo-classes:** `:hover`/`active` etc podem existir no Tailwind, mas devem ser tratadas como baixa compatibilidade no Lynx (filtrar quando necessário).
- **Scroll no Lynx:** para conteúdo rolável, usar componente `scroll-view` com `scroll-y`; em cenários de teste, usar altura explícita para garantir área de rolagem.
- **TypeScript do config Node:** se `lynx.config.ts` importar código em `src/lib/...`, incluir esses arquivos em `tsconfig.node.json` para evitar `TS6307`.
- **Compatibilidade TS alvo Node:** evitar APIs que podem falhar no target atual (ex: trocar `replaceAll` por `replace(/.../g, ...)` quando necessário).
- **Estratégia de segurança no plugin:** manter abordagem de allow-list para propriedades/at-rules/pseudo-selectors, em vez de block-list.
- **Testes:** manter testes unitários do pipeline (`sanitizeLynxCss` / `buildLynxTailwindCss`) cobrindo:
  - remoção de regras incompatíveis
  - resolução de variáveis
  - conversão de unidades
  - conversão de `oklch` para `rgb/rgba`
