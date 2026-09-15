# Carimbo Eletrônico — sistema de carimbo em PDF

Aplicativo de página única onde o usuário sobe um PDF (nota fiscal ou boleto), escolhe um dos 3 carimbos, preenche os campos, arrasta o carimbo até um espaço livre da página e baixa/imprime o PDF final carimbado.

## Fluxo na tela

1. **Área de upload** — arrastar e soltar o PDF ou clicar para escolher o arquivo.
2. **Escolha do carimbo** — três cartões: Lançamento (boleto), Classificação (nota fiscal), Vencimento (nota fiscal).
3. **Formulário** — aparecem só os campos do carimbo escolhido:
   - Lançamento: data + SPED FISCAL / CONTAS A PAGAR
   - Classificação: data, aproveita PIS/COFINS (Sim/Não), departamento, rateio, pl. contas, finalidade, CFOP, assinatura
   - Vencimento: data de vencimento
4. **Posicionamento** — a página do PDF aparece na tela; o carimbo já preenchido flutua por cima e pode ser arrastado com o mouse ou o dedo. Navegação entre páginas quando o PDF tem mais de uma. Também dá para aumentar/diminuir o tamanho do carimbo.
5. **Confirmar** — gera um novo PDF com o carimbo desenhado exatamente naquele ponto, sem alterar nada do conteúdo original.
6. **Baixar e imprimir** — dois botões no final, além de "carimbar outro documento".

## Aparência do carimbo

Reproduz os carimbos de borracha atuais: moldura retangular, texto em caixa alta, linhas para os campos, com a data e as opções já preenchidas e a caixinha marcada com X na opção escolhida. Visual sóbrio, tinta escura, levemente translúcido para não esconder o que está embaixo.

## Detalhes técnicos

- `pdfjs-dist` para renderizar a página em canvas (worker local, sem CDN).
- `pdf-lib` para escrever o carimbo no PDF original e gerar o arquivo final; desenho vetorial (retângulos, linhas e texto Helvetica) convertendo a posição do preview para coordenadas do PDF, respeitando escala e rotação da página.
- Componentes: `PdfDropzone`, `StampPicker`, `StampForm` (um por modelo), `PdfCanvas`, `DraggableStamp`, `StampArtwork` (mesma fonte de verdade para o preview e para o desenho no PDF), tudo orquestrado em `src/routes/index.tsx`.
- Tudo roda no navegador; nenhum arquivo é enviado a servidor, nada é salvo.
- Impressão via abertura do PDF gerado em nova aba com diálogo de impressão.
- Design system em `src/styles.css` (tokens novos para o tom de tinta e papel), sem cores fixas nos componentes. Interface em português.
- Metadados de título/descrição próprios na página inicial.

## Fora desta versão

Login, histórico de notas carimbadas, listas fixas de departamento/CFOP.
