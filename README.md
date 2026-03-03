# Matchr

App mobile para gestão de torneios de voleibol de praia — criação de torneios, vertentes (M/F/MX), grupos, resultados set a set e brackets eliminatórios.

Construída com **React Native**, **Expo SDK 54** e **TypeScript**.

## Pré-requisitos

- [Node.js](https://nodejs.org) 18+
- [Expo Go](https://expo.dev/go) no telemóvel (App Store / Google Play)
- (Opcional) [EAS CLI](https://docs.expo.dev/eas/) para compilar builds nativos — `npm install -g eas-cli`

## Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npx expo start
```

Aparece um QR code no terminal:

- **iOS** — abre a câmara e aponta para o QR code
- **Android** — abre o Expo Go e faz scan do QR code

A app carrega diretamente no telemóvel. Qualquer mudança no código atualiza automaticamente (hot reload).

## Testes

```bash
# Correr todos os testes
npm test

# Modo watch (re-corre ao guardar ficheiros)
npm test -- --watch

# Correr um ficheiro específico
npm test -- scoring.test.ts
```

Os testes estão em `src/__tests__/` e usam **Jest** + **ts-jest**.

| Ficheiro de teste | O que cobre |
|---|---|
| `scoring.test.ts` | Cálculo de pontos, vitórias, sets e tie-breaks |
| `teamUtils.test.ts` | Utilitários de equipas |
| `constants.test.ts` | Constantes e meses em PT |
| `filteredGames.test.ts` | Filtragem de jogos por grupo/estado |
| `saveSetLogic.test.ts` | Lógica de validação e gravação de sets |

## Compilar builds nativos

```bash
# APK (Android)
npx eas build -p android --profile preview

# IPA (iOS) — requer conta Apple Developer ($99/ano)
npx eas build -p ios --profile preview
```

## Estrutura do projeto

```
src/
├── components/     Componentes reutilizáveis
│   ├── Breadcrumb       Navegação breadcrumb
│   ├── Button           Botão com gradiente
│   ├── GameCard         Card de jogo com resultado
│   ├── LiveDot          Indicador de jogo a decorrer
│   ├── SubBadge         Badge de vertente (M/F/MX)
│   └── TeamGamesSheet   Bottom sheet com jogos de uma equipa
│
├── screens/        Um ficheiro por ecrã (21 ecrãs)
│   ├── HomeScreen                 Lista de torneios
│   ├── CreateTournamentScreen     Criar novo torneio
│   ├── EditTournamentScreen       Editar torneio existente
│   ├── TournamentDetailScreen     Detalhe com vertentes
│   ├── VertenteHubScreen          Hub de uma vertente
│   ├── ConfigureVertenteScreen    Configurar vertente
│   ├── TeamListScreen             Lista de equipas
│   ├── AddTeamScreen              Adicionar equipa
│   ├── GroupsTableScreen          Tabela classificativa
│   ├── GroupsGamesScreen          Lista de jogos do grupo
│   ├── GroupsEmptyScreen          Placeholder sem grupos
│   ├── EnterResultScreen          Introduzir resultado set a set
│   ├── EditGameScreen             Editar jogo
│   ├── GamePausedScreen           Jogo pausado
│   ├── BracketScreen              Bracket eliminatório
│   ├── PodiumScreen               Pódio final
│   ├── FinishedTournamentScreen   Torneio terminado
│   ├── ConfirmCloseScreen         Confirmar fecho de vertente
│   ├── ConfirmCloseTournamentScreen  Confirmar fecho de torneio
│   ├── WithdrawConfirmScreen      Confirmar desistência
│   └── ExportScreen               Exportar dados
│
├── navigation/     Stack navigator (React Navigation)
├── theme/          Cores, tipografia, espaçamentos, gradientes
├── types/          TypeScript types (Tournament, Team, Game, etc.)
├── utils/          Lógica de negócio e helpers
│   ├── scoring          Cálculo de classificações
│   ├── vertenteConfig   Config por tipo de vertente (label/emoji/cor)
│   ├── teamUtils        Utilitários de equipas
│   ├── constants        Meses PT e constantes
│   └── groupColors      Cores por grupo
│
├── mock/           Dados mock (sem backend)
└── __tests__/      Testes unitários (Jest)
```

## Stack tecnológica

| Tecnologia | Utilização |
|---|---|
| React Native 0.81 | Framework mobile |
| Expo SDK 54 | Toolchain e builds |
| TypeScript 5 | Tipagem estática |
| React Navigation 7 | Navegação stack |
| expo-linear-gradient | Gradientes nos botões e headers |
| Jest + ts-jest | Testes unitários |
| Reanimated 4 | Animações |

## Notas

- Todos os dados são **mock** (sem backend) — ver `src/mock/data.ts`
- A navegação usa **route params** para passar IDs entre ecrãs (tournamentId → vertenteId → gameId)
- Vertentes suportadas: **Masculino (M)**, **Feminino (F)** e **Misto (MX)**, cada uma com níveis de 1 a 6
