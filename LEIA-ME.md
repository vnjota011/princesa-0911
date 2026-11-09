# O reino de Bruna — versão melhorada

## Abrir
Extraia a pasta inteira. Abra **PREVIA.html** para testar tudo agora.  
Abra **index.html** para ver a abertura que aguarda o aniversário.  
Funciona localmente no Chrome, Edge e Firefox; não precisa Node ou instalação.

## Abertura
Liberação em **09/11/2026 às 00:00**, horário de Brasília.  
Antes: princesa e porquinho dormem, com data, reticências, Zzz e vaga-lumes.  
Depois: reticências somem e aparece **“Acordar a princesa”**.  
O clique toca uma sequência de quatro poses com transições (~5 s) antes de entrar na aventura.  
O horário usa o relógio do dispositivo. Esta é uma surpresa visual, não um bloqueio seguro: os arquivos e o parâmetro `?preview=1` permitem antecipar a experiência.

## Conteúdo
- Cavaleiro criado a partir das referências de Vinícius.
- Princesa aprovada e porquinho, com poses de despertar.
- Jardim medieval noturno com castelo, luz quente e estrelas.
- **Vaga-lumes:** capturar cinco luzes (com animação e som).
- **Memória:** cinco fotos originais do casal, em cinco pares.
- **Presentes:** encontrar três símbolos dourados (elogios personalizados).
- **Pergaminho:** trocar seis peças até formar a frase (feedback visual das peças corretas).
- Carta e encerramento com confetes.
- Todos os jogos podem ser pulados, sem limite de tempo.

## Melhorias desta versão
- CSS organizado, responsivo e com animações suaves.
- Efeitos sonoros sutis (Web Audio API) — botão ♪ no cabeçalho; música ao acordar a princesa.
- Confetes dourados ao completar jogos e no final.
- Estrelas cintilantes no céu da paisagem.
- Feedback visual no quebra-cabeça (peças no lugar certo ficam verdes).
- Transições entre capítulos e painéis.
- Layout responsivo com áreas seguras e botões confortáveis ao toque; testado na viewport do iPhone 15 Pro Max (430 × 932 CSS px).
- Preferência de som salva no navegador.
- Meta tags para compartilhamento.

## Personalizar antes de enviar
Edite **config.js**: carta, assinatura, três elogios e mensagem final.  
A carta é um exemplo; substitua pela sua mensagem pessoal.  
O presente ainda não foi escolhido: o encerramento atual é uma declaração. Troque `finalTitle` e `finalMessage` pela revelação desejada.  
As fotos estão em `assets/memoria-1.jpg` até `memoria-5.jpg`.

## Código
| Arquivo | Função |
|---------|--------|
| `index.html` | Estrutura e meta tags |
| `style.css` | Aparência, animações e mobile |
| `sleep.js` | Abertura em canvas e despertar |
| `app.js` | Data, navegação, jogos, sons e confetes |
| `config.js` | Textos e data de liberação |
| `assets/` | Fotos, artes e música do despertar |

## Estado da versão
Artes produzidas com ferramenta de geração de imagens, usando as referências enviadas.  
O despertar usa quatro poses e transições, não uma animação com muitos quadros.  
Efeitos sonoros são gerados no navegador; a música do despertar é carregada de `assets/until-i-found-you.mp3`.  
Confira a aparência no seu navegador antes de compartilhar.
