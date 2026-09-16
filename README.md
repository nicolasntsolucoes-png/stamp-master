# Stamp Master

Quero criar um sistema web de "carimbo eletrônico" para digitalizar um 

processo interno da nossa fábrica de classificação de notas fiscais.

CONTEXTO ATUAL (processo manual):

Hoje usamos carimbos de borracha físicos. O responsável escolhe qual 

carimbo usar dependendo do tipo de documento/situação, carimba a nota 

ou o boleto, e preenche os campos à mão.

FLUXO DO SISTEMA:

1. Upload de PDF: a nota fiscal e/ou o boleto (dependendo do carimbo 

   escolhido, o documento de destino muda — ver abaixo).

2. Seleção manual de 1 entre 3 modelos de carimbo (o usuário escolhe 

   qual aplicar a cada documento).

3. Ao selecionar um carimbo, exibir um formulário dinâmico apenas com 

   os campos daquele carimbo específico.

4. Preview visual do PDF na tela, com o carimbo preenchido sobreposto 

   como um elemento arrastável. O usuário posiciona manualmente o 

   carimbo no espaço em branco da página antes de confirmar (nem toda 

   nota tem espaço livre no mesmo lugar, então o posicionamento é 

   sempre feito visualmente, nota por nota).

5. Ao confirmar a posição, gerar um novo PDF com o carimbo aplicado 

   naquele local exato, mantendo o conteúdo original intacto.

6. Botão de download do PDF final.

OS 3 MODELOS DE CARIMBO:

Carimbo 1 — "Lançamento" (aplicado no boleto):

- Data (campo de data)

- Tipo: SPED FISCAL ou CONTAS A PAGAR (seleção única)

Carimbo 2 — "Classificação" (aplicado na nota fiscal):

- Data de lançamento (campo de data)

- Aproveita PIS/COFINS: Sim / Não (seleção única)

- Departamento (texto livre)

- Rateio (texto livre)

- Pl. Contas (texto livre)

- Finalidade (texto livre)

- CFOP (texto livre)

- Responsável/Assinatura (texto livre)

Carimbo 3 — "Vencimento" (aplicado na nota fiscal, referente ao boleto):

- Data de vencimento (campo de data)

Todos os campos de texto são digitados livremente a cada uso (sem 

listas fixas por enquanto).

REQUISITOS TÉCNICOS:

- Upload de PDF (drag & drop ou seleção de arquivo)

- Renderização do PDF na tela para visualização e posicionamento

- Elemento do carimbo arrastável sobre o preview, com os dados já 

  preenchidos, para o usuário posicionar antes de gerar o PDF final

- Geração de novo PDF com o carimbo aplicado na posição escolhida, 

  mantendo o conteúdo original intacto

- Botão de download e imprimir o PDF final

Por enquanto, sistema de usuário único (sem perfis separados). 

Não precisa de histórico/banco de dados de notas já carimbadas nesta 

primeira versão — apenas processar e baixar o PDF.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ac21f5a7-924f-44fb-82bf-d229ef0c0415).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
