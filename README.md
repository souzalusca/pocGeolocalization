# Geolocalização POC — React + MVVM

POC que captura a geolocalização do dispositivo ao clicar em um botão, exibe os dados capturados e mostra o ponto num mapa (Leaflet + OpenStreetMap, sem chave de API).

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes unitários e de integração
npm run lint
npm run build
```

> A Geolocation API só funciona em **contexto seguro** (HTTPS ou `localhost`). Para testar no celular pela rede local, use HTTPS (ex.: `@vitejs/plugin-basic-ssl`) ou um túnel (ngrok, cloudflared).

## Arquitetura (MVVM)

```
src/
├── domain/                     ← MODEL (regras e contratos, sem React)
│   ├── models/
│   │   ├── GeoPosition.ts          tipo de domínio + opções padrão
│   │   └── GeolocationError.ts     erro de domínio com código e mensagem ao usuário
│   └── services/
│       └── GeolocationService.ts   interface (porta) do serviço
├── data/                       ← implementação concreta do Model
│   └── services/
│       └── BrowserGeolocationService.ts   adapter da navigator.geolocation
├── viewmodels/                 ← VIEWMODEL (estado + comandos + formatação)
│   ├── geolocationState.ts         reducer com união discriminada
│   ├── geolocationFormatters.ts    domínio → dados de exibição (pt-BR)
│   └── useGeolocationViewModel.ts  hook exposto à View
├── views/                      ← VIEW (só renderiza e dispara comandos)
│   ├── components/ LocationButton, LocationDetails, LocationMap, ErrorAlert
│   └── pages/      GeolocationPage
├── app/                        ← composição / injeção de dependência
│   ├── ServicesContext.ts
│   ├── ServicesProvider.tsx
│   └── App.tsx
└── test/                       ← setup e fakes compartilhados
```

**Fluxo:** `View → vm.requestLocation() → GeolocationService (interface) → BrowserGeolocationService → navigator.geolocation`. O resultado volta para o reducer da ViewModel, que expõe `details`, `position`, `errorMessage`, `isLoading` e `buttonLabel` já prontos para a View.

### Boas práticas aplicadas

- **Inversão de dependência:** a ViewModel depende da interface `GeolocationService`, injetada por Context. Trocar a fonte (mock, IP lookup, app nativo) não mexe na ViewModel nem na View.
- **Estado como união discriminada** (`idle | loading | success | error`) — estados impossíveis não compilam.
- **Sem race conditions:** cliques repetidos, `reset` ou desmontagem invalidam respostas antigas via `requestId`.
- **Última posição preservada** enquanto busca de novo ou se a nova tentativa falhar.
- **Erros tratados na borda:** códigos W3C são convertidos em `GeolocationError` com mensagens amigáveis; checagem de contexto seguro e suporte do navegador.
- **Views sem lógica:** componentes recebem props prontas; formatação (`Intl` pt-BR) vive na ViewModel.
- **Performance:** Leaflet é carregado com `lazy()` apenas quando há posição para exibir.
- **Acessibilidade:** `role="alert"`, `aria-live`, `aria-busy`, `dl/dt/dd`, foco visível, dark mode e `prefers-reduced-motion`.
- **TypeScript estrito** (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`) + ESLint com regras de hooks.
- **Testes por camada:** reducer, adapter do navegador (com `Geolocation` fake), ViewModel (`renderHook` com serviço controlável) e integração da página.
