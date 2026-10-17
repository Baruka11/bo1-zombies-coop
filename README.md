<div align="center">

<img src="extension/icons/icon128.png" width="96" alt="">

# BO1 Zombies Co-op

**Play Black Ops 1 Zombies in your browser with up to 4 friends, online.**<br>
A free Chrome extension for [vel.gg/bsz](https://vel.gg/bsz/): host a game, send a link, play Kino der Toten together.<br>
With controller support and a fun mode for the host (god mode, wonder weapons, infinite ammo, flying and more).

[![Latest release](https://img.shields.io/github/v/release/Baruka11/bo1-zombies-coop?label=download&color=e2552f)](https://github.com/Baruka11/bo1-zombies-coop/releases)
![Players](https://img.shields.io/badge/players-up%20to%204-63d471)
![Maps](https://img.shields.io/badge/maps-all%2010-5aa8ff)
![Browser](https://img.shields.io/badge/browser-Chrome-f4c542)

### [⬇ Download the extension](https://github.com/Baruka11/bo1-zombies-coop/releases/latest/download/bo1-zombies-coop.zip) · [Install guide with pictures](https://allanlotta.github.io/bo1-zombies-coop/)

**English** · [Français](#français) · [Português](#português)

<img src="docs/images/four-players.jpg" width="860" alt="Four players in the same lobby, one browser each: the host and three friends, with names, status and ping">

</div>

> [!NOTE]
> This is a fork of [AllanLotta/bo1-zombies-coop](https://github.com/AllanLotta/bo1-zombies-coop), kept working with
> vel.gg's current engine (the original stopped working with it). Added here: the new engine and the
> `/bsz/` address, a faster pause, **direct links between players** (WebRTC, with the relay as fallback) with a
> "Relay only" switch to hide your IP address and a locked host seat, and a **diagnostic report** button.
> Download from this repository's [Releases](https://github.com/Baruka11/bo1-zombies-coop/releases): the install guide's
> pictures below are still right for the steps, but its download button goes to the original. `v2.2.3` is the stable
> version without direct links.

> [!IMPORTANT]
> **Playing with friends? [Create your own relay](#run-your-own-relay-recommended-for-your-group) first.** Co-op runs
> through a relay. The shared one is free but small: a few hours of play a day for **everyone** together, and when it
> runs out co-op stops until midnight UTC. Your own relay is free too, takes 5 minutes, and is only for your group.
> The Co-op card has a **Create my relay** button that takes you to the [step-by-step guide](https://allanlotta.github.io/bo1-zombies-coop/#relay).

## Features

- **Up to 4 players online**: one hosts, up to three join with an invite link. Works over the internet; nobody needs
  to be on the same Wi-Fi or open ports.
- **A lobby everyone sees**: each player's name, colour (white, blue, yellow, green, as on the BO1 scoreboard),
  status and ping, so you always know who is loading, joining or ready.
- **Everyone spawns together**: the host's start waits until the others are in (or starts now, if you prefer).
- **All 10 maps**, Hell mode included: Kino der Toten, Five, Der Riese, Nacht der Untoten, Verrückt, Shi No Numa,
  Ascension, Call of the Dead, Shangri-La and Moon.
- **Pause together**: any player opening the menu pauses everyone.
- **Fun mode** for the host: god mode, invisible, noclip, fly, speed and points per player; infinite ammo; one-hit or
  passive zombies; game speed, jump and gravity; wonder weapons. [More below](#fun-mode).
- **PlayStation and Xbox controllers** with adjustable aim speed.
- **English, French and Portuguese**: the card follows your browser's language, and Settings > Language changes it at once (no reload).
- **Stable**: fixes the crash where one player pressing Escape or T (chat) took down the other players' games.

<p align="center"><img src="docs/images/in-game.png" width="640" alt="Playing Kino der Toten in co-op, with the players indicator in the corner"><br><sub>In game, the card folds into a small indicator: one dot per player, and your ping</sub></p>

<table>
<tr>
<td align="center"><img src="docs/images/lobby-host.png" width="250" alt="Host lobby"><br><sub>Hosting: room code, steps, lobby</sub></td>
<td align="center"><img src="docs/images/joining.png" width="250" alt="Joining"><br><sub>Joining: progress and what to do next</sub></td>
<td align="center"><img src="docs/images/lobby-guest.png" width="250" alt="Guest lobby with settings"><br><sub>In the lobby, with settings open</sub></td>
</tr>
</table>

## Install (2 minutes, every player)

Step-by-step page with pictures, in English and Portuguese: **[allanlotta.github.io/bo1-zombies-coop](https://allanlotta.github.io/bo1-zombies-coop/)**

1. **[Download the extension](https://github.com/Baruka11/bo1-zombies-coop/releases/latest/download/bo1-zombies-coop.zip)** and unzip it.
   You get a folder called `bo1-zombies-coop`: move it somewhere it can stay (Chrome keeps using it).
2. Paste `chrome://extensions` into Chrome's address bar and switch on **Developer mode**, top right:

   <img src="docs/images/install/en-1.png" width="640" alt="Developer mode switch">
3. Click **Load unpacked** and pick the `bo1-zombies-coop` folder (the one with `manifest.json` inside):

   <img src="docs/images/install/en-2.png" width="640" alt="Load unpacked button">
4. Done. Open [vel.gg/bsz](https://vel.gg/bsz/): the **Co-op** card appears in the top right corner.

   <img src="docs/images/install/en-3.png" width="640" alt="The installed extension">

Chrome may show a popup about developer-mode extensions when it starts: that's normal, just close it.
The Co-op card does not announce this fork's updates: check the [Releases](https://github.com/Baruka11/bo1-zombies-coop/releases) page, then replace the folder's files with the new ones and reload the extension.

## Play

**Host**

1. On the Co-op card, click **Host a game**, then **Copy link** and send it to your friends.
2. Pick a map. Everyone else follows you to it automatically.
3. Wait on the "click to start" screen until the lobby shows everyone as **Ready**, then click the game.

**Friends**

1. Open the invite link and press any key when the page asks, to load the map.
2. Wait until the card says **You are in**, then click the game.

Tips:

- Set your name under **Settings** so it shows in everyone's lobby.
- Somebody got disconnected? They click **Rejoin**. Joining after the start means watching until the next round,
  as in the original game.
- Spawned far away from the others? **Go to the host** on the card brings you next to them.

## Fun mode

<img src="docs/images/fun-mode.png" width="300" align="right" alt="The fun mode panel on the Co-op card">

For the host, or when you play solo. It changes your own game server, so it applies to everyone in your game, and
your friends don't need anything extra. Press **Esc** in game to open the Co-op card, then **Fun mode**.

- **Per player, or everyone at once:** god mode, can't die, invisible to zombies, noclip, fly, speed from 0.5× to
  3×, points (+5k, +50k, max).
- **Ammo:** infinite clip, infinite reserve, refill everyone.
- **Zombies:** die in one hit, ignore players, clear the map.
- **World:** game speed, jump height, gravity.
- **Weapons for the host:** Ray Gun, Thundergun, Wunderwaffe, Winter's Howl, Wave Gun, Scavenger, Crossbow,
  Ballistic Knife, Monkey Bomb, Gersh Device and more, upgraded versions included. Only the ones that exist on the
  current map work; the card tells you when one doesn't.
- **Reset everything** puts the game back to normal.

Switch off Fly and Noclip while standing on the floor, or you fall out of the map.

Everything goes through the engine's own cheat mechanisms (the flags behind its `god`, `notarget`, `noclip` and
`ufo` console commands, its ammo and score fields, and commands such as `give`, `timescale` and `ai`).

<br clear="right">

## Troubleshooting

| Problem | What to do |
| --- | --- |
| "vel.gg updated its game engine…" | vel.gg shipped a new engine. Co-op switches itself off until this extension is updated; check for a new release. |
| "You and the host have different versions" | Both reload the page (the engine is cached per browser). |
| "This game is full" | A room holds 4 players. Wait for a free seat or host another room. |
| Stuck on "Next in line" | Players connect one at a time; it moves on within a minute. If it does not, reload. |
| vel.gg has its own multiplayer now | While you host or join from the Co-op card, the extension keeps vel.gg in single-player mode and runs co-op itself (lobby, controllers, synchronized pause, fun mode). To use vel.gg's own multiplayer, don't host or join from the card. |
| "This relay used up today's free allowance" | The shared relay is out for today (it comes back at midnight UTC). [Create your own relay](#run-your-own-relay-recommended-for-your-group): 5 minutes, free. |

Works in Chrome. Other Chromium browsers (Edge, Brave, Opera) load the same extension but are not tested.

## Run your own relay (recommended for your group)

Players connect through a small relay on Cloudflare that only forwards game packets. The default relay is shared by
**everyone** who uses the extension, on Cloudflare's free plan: about **4 hours of 2-player games, or 1½ hours of
4-player games, per day for all of them together**. When that runs out, co-op stops for everybody until midnight UTC,
and the card says so.

Your own relay is free too, takes about 5 minutes, and its allowance is only for the people you invite.

**With the button (no terminal):**

1. Create a free account at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) and confirm your email.
2. Click [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Baruka11/bo1-zombies-coop/tree/main/relay), sign in, allow it to
   create a copy of the relay in your GitHub account, and click **Deploy**. If Cloudflare asks you to pick a
   `workers.dev` subdomain, any name works.
3. Copy your relay's address when it is ready: `https://bo1-zombies-coop-relay.<your-name>.workers.dev`.
4. On the Co-op card: **Settings → Change relay**, paste it, **Save**.

Your invite links carry your relay, so friends switch to it with one click (**Use this relay** on their card).

**With the terminal** (needs [Node.js](https://nodejs.org) 22+):

```sh
git clone https://github.com/Baruka11/bo1-zombies-coop
cd bo1-zombies-coop/relay
npm install
npx wrangler login     # opens the browser: click Allow
npx wrangler deploy    # prints your relay's address
```

Then step 4 above.

## How it works

vel.gg runs the decompiled Black Ops 1 engine as WebAssembly. The engine's own client and server still talk through
in-memory "loopback" queues, as a listen server does for its local player. The extension builds on that, separately
from vel.gg's own multiplayer (which it keeps switched off during a session):

1. **Patches the engine as it loads** (after checking its exact SHA-256 and every function by name): a mailbox for
   console commands, a switch to park the local server, an extra inbound queue for the host's server, and two
   crash fixes (players in a menu, and a command flood from guests waiting in the lobby).
2. **Gives each guest its own loopback queue on the host**, so the host's real game server sees up to three remote
   players as ordinary local clients, each with a distinct port and qport.
3. **Starts the host with vel.gg's own co-op rules** (`kisak_web_coop`): the level script treats the game as co-op
   rather than solo, and the round starts when the host clicks in, with everyone already connected. Game over slows
   every client down; after the restart the extension puts guests back to normal speed, which the engine only does
   where the server runs.
4. **Pumps packets** between those queues and a WebSocket in a Worker, through a Cloudflare Durable Object per room
   that routes them by seat without looking inside.
5. **Links players directly when it can** (WebRTC data channels, `src/net/direct.js`). The relay still sets up the
   room and carries the handshake, and stays the fallback: when a direct link is missing or drops, packets simply keep
   going through it. Game packets use an unordered, unreliable channel (the engine has its own netcode on top), and
   control messages (pause, lobby, positions) a reliable one, which also measures the ping.

### Direct links and your privacy

A direct link cuts the delay (no detour through the relay) and takes the load off the relay's daily allowance. The
price is that **the players in the room can see each other's IP address**, which the relay otherwise hides. So:

- **Settings > "Relay only"** turns direct links off for you. Nothing of WebRTC is touched then, and the other players
  are told to stay on the relay. The card shows the route per player (Direct or Relay).
- Only the people with your invite link can join, and a room holds four players. The room code is 80 random bits.
- STUN is the only WebRTC server used (Google's and Cloudflare's public ones, so they see that your IP asked). There
  is no TURN: the relay is the fallback.
- Handshake messages are checked before the browser sees them (a data-channel session only, size and shape, a handful
  of candidates), one link per seat, only the two expected channels. Game frames and control messages are size-checked
  and rate-limited per player; a player over the limit loses the link and is not linked again for a minute.
  Control messages from a link get the same checks as from the relay, and the sender never chooses its own `from`.
- **The host seat is locked.** The host sends a secret token (kept in the tab's session storage); the relay then
  refuses anyone else who knows only the room code. It needs a relay with this version of `relay/` deployed; relays
  that predate it ignore the token and work as before. If a host loses the token (closes the tab), the lock frees
  itself after ten minutes.
- What does not change: whoever runs the relay can see the handshake and the packets on the relay path, and every
  player's engine still parses the other players' packets. Play with people you know, and use your own relay.

## Development

```
extension/        what players load: manifest, icons and the built coop.js
src/
  engine/         known engine builds, wasm patching, shared-memory access
  net/            packet pump worker and loopback queues
  session/        host, guest, lobby, control messages, engine hooks
  ui/             the card, its view model, styles and texts (EN/PT)
  input/          controller support
  fun/            fun mode (host cheats panel)
  game/ util/     vel.gg page helpers, settings, relay selection
relay/            Cloudflare Worker + Durable Objects, and the wire protocol (deploys on its own)
test/             relay, engine patch, end-to-end and UI preview tests
scripts/          build, packaging, icons and screenshots (README, install guide)
docs/             the install page (GitHub Pages) and its images
```

```sh
npm install
npm run build              # src/ -> extension/coop.js
npm run check              # lint + build + engine patch test
npm run relay:dev          # relay on http://127.0.0.1:8787
npm run test:relay         # routing and host-lock test against it
node test/e2e.mjs 2 kino   # two real browsers playing through the local relay
# test/direct.html: serve the repo root, open /test/direct.html in a browser; the title says PASS or FAIL (direct links)
npm run preview            # screenshots of every card state (no game loaded)
npm run package            # dist/bo1-zombies-coop.zip (same name every release, for the download link)
```

Each end-to-end player is a full game engine using several GB of memory: on a 16 GB machine, test with 3 at most.

## Credits

The game in the browser is [vel.gg](https://vel.gg/bsz/) by MisaDev4, built on the decompiled engine. This project
started from invictus841's two-player co-op extension.

Not affiliated with Activision or Treyarch. Call of Duty and Black Ops are trademarks of Activision Publishing.

---

## Português

**Jogue Black Ops 1 Zombies no navegador com até 4 amigos, online.** Extensão gratuita do Chrome para o
[vel.gg/bsz](https://vel.gg/bsz/): um hospeda, manda o link, e todo mundo joga junto, inclusive no Kino der Toten.
Com controle e um modo diversão para o host (imortal, armas especiais, munição infinita, voar e mais).

> [!NOTE]
> Este é um fork de [AllanLotta/bo1-zombies-coop](https://github.com/AllanLotta/bo1-zombies-coop), mantido funcionando
> com o motor atual do vel.gg (o original parou de funcionar com ele). O que tem aqui a mais: o motor novo
> e o endereço `/bsz/`, pausa mais rápida, **conexão direta entre os jogadores** (WebRTC, com o relay como reserva), com
> um botão "Só relay" para esconder o seu IP e o lugar do host trancado, e um botão de **relatório de diagnóstico**.
> Baixe pelas [Releases](https://github.com/Baruka11/bo1-zombies-coop/releases) deste repositório: as imagens do passo
> a passo abaixo continuam certas, mas o botão de download dele vai para o original. `v2.2.3` é a versão estável, sem
> conexão direta.

> [!IMPORTANT]
> **Vai jogar com os amigos? [Crie o seu relay](#relay-próprio-recomendado-para-o-seu-grupo) antes.** O co-op passa
> por um relay. O compartilhado é grátis, mas pequeno: algumas horas de jogo por dia para **todo mundo** junto, e quando
> acaba o co-op para até as 21h (horário de Brasília). O seu próprio relay também é grátis, leva 5 minutos e é só do
> seu grupo. O cartão Co-op tem um botão **Criar meu relay** que leva ao [passo a passo](https://allanlotta.github.io/bo1-zombies-coop/?lang=pt#relay).

<table>
<tr>
<td align="center"><img src="docs/images/lobby-host-pt.png" width="250" alt="Lobby do host"><br><sub>Hospedando: código da sala e lobby</sub></td>
<td align="center"><img src="docs/images/joining-pt.png" width="250" alt="Entrando"><br><sub>Entrando: progresso e próximo passo</sub></td>
</tr>
</table>

### O que tem

- **Até 4 jogadores online**, pela internet, sem precisar estar na mesma rede nem abrir portas.
- **Lobby para todos**: nome, cor (branco, azul, amarelo, verde, como no placar do BO1), status e ping de cada um.
- **Todos nascem juntos**: o início do host espera os outros entrarem (ou começa na hora, se preferir).
- **Os 10 mapas**, com Hell mode.
- **Pausa sincronizada**: quem abre o menu pausa para todos.
- **Modo diversão** para o host: imortal, invisível, atravessar paredes, voar, velocidade e pontos por jogador;
  munição infinita; zumbis de 1 tiro ou que ignoram vocês; velocidade do jogo, pulo e gravidade; armas especiais.
  [Detalhes abaixo](#modo-diversão).
- **Controle de PlayStation e Xbox**, com ajuste de velocidade da mira.
- **Em português, inglês ou francês**: o cartão segue o idioma do navegador, e Configurações > Idioma troca na hora (sem recarregar).
- **Corrige o crash** em que um jogador apertando ESC ou T (chat) derrubava o jogo dos outros.

### Instalar (2 minutos, cada jogador)

Passo a passo com imagens: **[allanlotta.github.io/bo1-zombies-coop](https://allanlotta.github.io/bo1-zombies-coop/?lang=pt)**

1. **[Baixe a extensão](https://github.com/Baruka11/bo1-zombies-coop/releases/latest/download/bo1-zombies-coop.zip)** e descompacte.
   Aparece uma pasta `bo1-zombies-coop`: deixe ela num lugar fixo, como Documentos (o Chrome continua usando a pasta).
2. Cole `chrome://extensions` na barra de endereços do Chrome e ligue o **Modo do desenvolvedor**, no canto superior direito:

   <img src="docs/images/install/pt-1.png" width="640" alt="Modo do desenvolvedor">
3. Clique em **Carregar sem compactação** e escolha a pasta `bo1-zombies-coop` (a que tem o `manifest.json` dentro):

   <img src="docs/images/install/pt-2.png" width="640" alt="Carregar sem compactação">
4. Pronto. Abra o [vel.gg/bsz](https://vel.gg/bsz/): o cartão **Co-op** aparece no canto superior direito.

   <img src="docs/images/install/pt-3.png" width="640" alt="A extensão instalada">

Ao abrir, o Chrome pode mostrar um aviso sobre extensões em modo de desenvolvedor: é normal, só feche.
O cartão Co-op não avisa das atualizações deste fork: veja a página de [Releases](https://github.com/Baruka11/bo1-zombies-coop/releases), troque os arquivos da pasta pelos novos e recarregue a extensão.

### Jogar

**Host:** clique em **Hospedar partida**, depois em **Copiar link**, e mande para os amigos. Escolha o mapa (todos vão
junto). Espere na tela "click to start" até todos aparecerem como **Pronto** no lobby e clique no jogo.

**Amigos:** abram o link e apertem qualquer tecla quando a página pedir, para carregar o mapa. Quando o cartão disser
**Você entrou**, cliquem no jogo.

Dicas: coloque seu nome em **Configurações**. Se alguém cair, é só clicar em **Voltar para a partida** (quem entra
depois do início assiste até a próxima rodada, como no jogo original). Nasceu longe? **Ir até o host**.

### Modo diversão

<img src="docs/images/fun-mode-pt.png" width="300" align="right" alt="O painel do modo diversão no cartão Co-op">

Para quem hospeda, ou quando você joga sozinho. Ele mexe no seu próprio servidor do jogo, então vale para todo mundo
na sua partida, e os amigos não precisam de nada a mais. Aperte **Esc** no jogo para abrir o cartão Co-op e depois
**Modo diversão**.

- **Por jogador, ou todos de uma vez:** imortal, não morre, invisível para os zumbis, atravessa paredes, voa,
  velocidade de 0,5× a 3×, pontos (+5k, +50k, máximo).
- **Munição:** pente infinito, reserva infinita, encher a de todos.
- **Zumbis:** morrem com 1 tiro, ignoram vocês, limpar o mapa.
- **Mundo:** velocidade do jogo, altura do pulo, gravidade.
- **Armas para o host:** Ray Gun, Thundergun, Wunderwaffe, Winter's Howl, Wave Gun, Scavenger, Crossbow, Ballistic
  Knife, Monkey Bomb, Gersh Device e outras, inclusive as versões turbinadas. Só funcionam as que existem no mapa
  atual; o cartão avisa quando uma não existe.
- **Resetar tudo** volta o jogo ao normal.

Desligue Voa e Atravessa com os pés no chão, senão você cai para fora do mapa.

<br clear="right">

### Problemas comuns

| Problema | O que fazer |
| --- | --- |
| "O vel.gg atualizou o motor do jogo…" | Saiu um motor novo; o co-op se desliga até a extensão ser atualizada. Veja se há versão nova. |
| "Versões diferentes do jogo" | Os dois recarregam a página. |
| "Esta partida está cheia" | A sala comporta 4 jogadores. |
| Parado em "Na fila para entrar" | Os jogadores entram um de cada vez; em até um minuto anda. Se não, recarregue. |
| O vel.gg agora tem multiplayer próprio | Quando você hospeda ou entra pelo cartão Co-op, a extensão deixa o vel.gg no modo single player e faz o co-op ela mesma (lobby, controle, pausa sincronizada, modo diversão). Para usar o multiplayer do vel.gg, é só não hospedar nem entrar pelo cartão. |
| "Este relay usou toda a cota grátis de hoje" | O relay compartilhado acabou por hoje (volta às 21h de Brasília). [Crie o seu relay](#relay-próprio-recomendado-para-o-seu-grupo): 5 minutos, grátis. |

### Relay próprio (recomendado para o seu grupo)

O relay padrão é dividido por **todo mundo** que usa a extensão, no plano grátis da Cloudflare: umas **4 horas de jogo
a 2, ou 1 hora e meia a 4, por dia, para todos juntos**. Quando acaba, o co-op para até as 21h (meia-noite UTC) e o
cartão avisa. O seu próprio relay também é grátis, leva uns 5 minutos e a cota dele é só do seu grupo.

**Pelo botão (sem terminal):**

1. Crie uma conta grátis em [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) e confirme o e-mail.
2. Clique em [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Baruka11/bo1-zombies-coop/tree/main/relay), entre na conta,
   autorize a criação de uma cópia do relay no seu GitHub e clique em **Deploy**. Se a Cloudflare pedir um subdomínio
   `workers.dev`, qualquer nome serve.
3. Copie o endereço do seu relay quando ficar pronto: `https://bo1-zombies-coop-relay.<seu-nome>.workers.dev`.
4. No cartão Co-op: **Configurações → Trocar relay**, cole o endereço e clique em **Salvar**.

Os seus links de convite já levam o relay junto: os amigos só clicam em **Usar este relay** no cartão deles.
Pelo terminal: veja os comandos na seção em inglês, acima.

---

## Français

**Joue à Black Ops 1 Zombies dans ton navigateur avec jusqu'à 4 amis, en ligne.** Extension Chrome gratuite pour
[vel.gg/bsz](https://vel.gg/bsz/) : l'un héberge, envoie le lien, et tout le monde joue ensemble, y compris sur Kino der
Toten. Avec la manette et un mode fun pour l'hôte (invincible, armes spéciales, munitions infinies, vol et plus).

> [!NOTE]
> Ceci est un fork de [AllanLotta/bo1-zombies-coop](https://github.com/AllanLotta/bo1-zombies-coop), maintenu pour
> fonctionner avec le moteur actuel de vel.gg (l'original a cessé de marcher avec lui). Ce qui est ajouté ici : le
> nouveau moteur et l'adresse `/bsz/`, une pause plus rapide, des **connexions directes entre les joueurs** (WebRTC, avec
> le relais en secours), avec un bouton « Relais seulement » pour cacher ton IP et une place d'hôte verrouillée, et un bouton
> de **rapport de diagnostic**. Télécharge depuis les [Releases](https://github.com/Baruka11/bo1-zombies-coop/releases)
> de ce dépôt : les images du guide d'installation restent justes pour les étapes, mais son bouton de téléchargement
> mène à l'original. `v2.2.3` est la version stable, sans connexion directe.

> [!IMPORTANT]
> **Tu joues avec des amis ? [Crée ton propre relais](#relais-personnel-recommandé-pour-ton-groupe) d'abord.** Le co-op
> passe par un relais. Le relais partagé est gratuit mais petit : quelques heures de jeu par jour pour **tout le monde**
> ensemble, et quand il est épuisé le co-op s'arrête jusqu'à minuit UTC (1 h ou 2 h du matin en France). Ton propre
> relais est gratuit aussi, prend 5 minutes et n'est que pour ton groupe. La carte Co-op a un bouton **Créer mon relais**
> qui mène au [guide pas à pas](https://allanlotta.github.io/bo1-zombies-coop/#relay) (en anglais).

<table>
<tr>
<td align="center"><img src="docs/images/lobby-host.png" width="250" alt="Lobby de l'hôte"><br><sub>Hébergement : code de la salle et lobby</sub></td>
<td align="center"><img src="docs/images/joining.png" width="250" alt="Connexion"><br><sub>Connexion : progression et étape suivante</sub></td>
</tr>
</table>

<sub>Les captures de ce README sont en anglais ; la carte, elle, s'affiche en français.</sub>

### Ce que ça fait

- **Jusqu'à 4 joueurs en ligne**, par internet, sans être sur le même réseau ni ouvrir de ports.
- **Un lobby pour tous** : nom, couleur (blanc, bleu, jaune, vert, comme au tableau des scores de BO1), état et ping de chacun.
- **Tout le monde apparaît ensemble** : le départ de l'hôte attend que les autres soient entrés (ou démarre tout de suite, si tu préfères).
- **Les 10 cartes**, Hell mode compris.
- **Pause synchronisée** : celui qui ouvre le menu met tout le monde en pause.
- **Mode fun** pour l'hôte : invincible, invisible, traverser les murs, voler, vitesse et points par joueur ; munitions
  infinies ; zombies morts en un coup ou qui vous ignorent ; vitesse du jeu, saut et gravité ; armes spéciales.
  [Détails plus bas](#mode-fun).
- **Manettes PlayStation et Xbox**, avec réglage de la vitesse de visée.
- **En français, en anglais ou en portugais** : la carte suit la langue de ton navigateur, et Réglages > Langue la change tout de suite (sans recharger).
- **Connexion directe entre joueurs** quand elle est possible, avec le relais en secours.
- **Corrige le crash** où un joueur appuyant sur Échap ou T (chat) faisait planter le jeu des autres.

### Installer (2 minutes, chaque joueur)

Guide pas à pas avec images (en anglais) : **[allanlotta.github.io/bo1-zombies-coop](https://allanlotta.github.io/bo1-zombies-coop/)**

1. **[Télécharge l'extension](https://github.com/Baruka11/bo1-zombies-coop/releases/latest/download/bo1-zombies-coop.zip)**
   et décompresse-la. Tu obtiens un dossier `bo1-zombies-coop` : mets-le dans un endroit fixe, comme Documents (Chrome
   continue à l'utiliser).
2. Colle `chrome://extensions` dans la barre d'adresse de Chrome et active le **Mode développeur**, en haut à droite :

   <img src="docs/images/install/en-1.png" width="640" alt="Interrupteur du mode développeur">
3. Clique sur **Charger l'extension non empaquetée** et choisis le dossier `bo1-zombies-coop` (celui qui contient `manifest.json`) :

   <img src="docs/images/install/en-2.png" width="640" alt="Bouton pour charger l'extension non empaquetée">
4. C'est prêt. Ouvre [vel.gg/bsz](https://vel.gg/bsz/) : la carte **Co-op** apparaît en haut à droite.

   <img src="docs/images/install/en-3.png" width="640" alt="L'extension installée">

Au démarrage, Chrome peut afficher un avertissement sur les extensions en mode développeur : c'est normal, ferme-le.
La carte Co-op n'annonce pas les mises à jour de ce fork : consulte la page des [Releases](https://github.com/Baruka11/bo1-zombies-coop/releases),
remplace les fichiers du dossier par les nouveaux et recharge l'extension.

### Jouer

**L'hôte :** clique sur **Héberger une partie**, puis **Copier le lien**, et envoie le lien à tes amis. Choisis la carte (tout le monde
suit). Attends sur l'écran « click to start » que tous apparaissent **Prêt** dans le lobby, puis clique dans le jeu.

**Les amis :** ouvrez le lien et appuyez sur une touche quand la page le demande, pour charger la carte. Quand la carte
dit **Tu es dedans**, cliquez dans le jeu.

Astuces : mets ton nom dans **Réglages**. Si quelqu'un se déconnecte, il clique sur **Revenir** (celui qui arrive après
le début regarde jusqu'à la manche suivante, comme dans le jeu d'origine). Apparu trop loin des autres ? **Aller vers l'hôte**.

### Mode fun

Pour l'hôte, ou quand tu joues seul. Il agit sur ton propre serveur de jeu, donc il vaut pour tous ceux de ta partie, et
tes amis n'ont besoin de rien de plus. Appuie sur **Échap** en jeu pour ouvrir la carte Co-op, puis **Mode fun**.

- **Par joueur, ou tous à la fois :** invincible, ne peut pas mourir, invisible pour les zombies, traverser les murs, voler,
  vitesse de 0,5× à 3×, points (+5k, +50k, maximum).
- **Munitions :** chargeur infini, réserve infinie, tout remplir pour tout le monde.
- **Zombies :** meurent en un coup, ignorent les joueurs, nettoyer la carte.
- **Monde :** vitesse du jeu, hauteur de saut, gravité.
- **Armes pour l'hôte :** Ray Gun, Thundergun, Wunderwaffe, Winter's Howl, Wave Gun, Scavenger, Crossbow, Ballistic
  Knife, Monkey Bomb, Gersh Device et d'autres, versions améliorées comprises. Seules celles qui existent sur la carte
  actuelle fonctionnent ; la carte te prévient quand l'une n'existe pas.
- **Tout réinitialiser** remet le jeu à la normale.

Désactive Voler et Traverser en étant au sol, sinon tu tombes hors de la carte.

### Connexion directe et vie privée

Une connexion directe réduit le délai (pas de détour par le relais) et soulage le quota du relais. En échange,
**les joueurs de la salle peuvent voir l'adresse IP des autres**, que le relais cache normalement.

- **Réglages > « Relais seulement »** désactive les connexions directes pour toi : tu restes derrière le relais. La carte
  montre la route de chaque joueur (Direct ou Relay).
- Seules les personnes qui ont ton lien d'invitation peuvent rejoindre, et une salle compte quatre joueurs.
- La **place d'hôte est verrouillée** par un jeton secret sur les relais à jour (ceux déployés avec le dossier `relay/` de
  ce dépôt) : quelqu'un qui ne connaît que le code de la salle ne peut plus prendre la partie.
- **Réglages > « Copier le rapport de diagnostic »** copie un rapport pour signaler un problème (version, routes, compteurs,
  durée des pauses, derniers événements). Il ne contient ni IP, ni nom, ni code de salle.
- Ce qui ne change pas : celui qui héberge le relais voit la mise en relation et les paquets passant par lui, et le moteur
  de chaque joueur analyse les paquets des autres. Joue avec des gens que tu connais, et utilise ton propre relais.

### Problèmes courants

| Problème | Quoi faire |
| --- | --- |
| « vel.gg a mis à jour son moteur de jeu… » | Un nouveau moteur est sorti ; le co-op se coupe jusqu'à la mise à jour de l'extension. Regarde s'il y a une nouvelle version. |
| « Toi et l'hôte avez des versions différentes du jeu » | Les deux rechargent la page. |
| « Cette partie est pleine » | La salle contient 4 joueurs. |
| Bloqué sur « Un autre joueur se connecte » | Les joueurs entrent un par un ; ça avance en moins d'une minute. Sinon, recharge. |
| vel.gg a maintenant son propre multijoueur | Quand tu héberges ou rejoins par la carte Co-op, l'extension laisse vel.gg en solo et fait le co-op elle-même (lobby, manette, pause synchronisée, mode fun). Pour utiliser le multijoueur de vel.gg, n'héberge ni ne rejoins par la carte. |
| « Ce relais a épuisé le quota gratuit d'aujourd'hui » | Le relais partagé est épuisé pour aujourd'hui (il revient à minuit UTC). [Crée ton relais](#relais-personnel-recommandé-pour-ton-groupe) : 5 minutes, gratuit. |
| Saccades ou téléportations | Ouvre Réglages > « Copier le rapport de diagnostic » juste après et envoie le texte à celui qui maintient l'extension. Essaie aussi « Relais seulement » pour comparer. |

### Relais personnel (recommandé pour ton groupe)

Le relais par défaut est partagé entre **tous** ceux qui utilisent l'extension, sur l'offre gratuite de Cloudflare :
environ **4 heures de jeu à 2, ou 1 h 30 à 4, par jour, pour tout le monde ensemble**. Quand il est épuisé, le co-op
s'arrête jusqu'à minuit UTC et la carte te prévient. Ton propre relais est gratuit aussi, prend environ 5 minutes, et son
quota n'est que pour ton groupe.

**Avec le bouton (sans terminal) :**

1. Crée un compte gratuit sur [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) et confirme l'e-mail.
2. Clique sur [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Baruka11/bo1-zombies-coop/tree/main/relay),
   connecte-toi, autorise la création d'une copie du relais dans ton GitHub et clique sur **Deploy**. Si Cloudflare
   demande un sous-domaine `workers.dev`, n'importe quel nom convient.
3. Copie l'adresse de ton relais quand il est prêt : `https://bo1-zombies-coop-relay.<ton-nom>.workers.dev`.
4. Dans la carte Co-op : **Réglages → Changer de relais**, colle l'adresse et clique sur **Enregistrer**.

Tes liens d'invitation portent déjà le relais : tes amis cliquent juste sur **Utiliser ce relais** sur leur carte.
Par le terminal : voir les commandes dans la section en anglais, plus haut.
