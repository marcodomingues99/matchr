# Matchr

App para gestão de torneios de padel — criação de torneios, categorias (M/F/MX), grupos, resultados set a set e brackets eliminatórios. Funciona em **mobile** (iOS/Android) e **web**, com layout responsivo.

Construída com **React Native**, **Expo SDK 54**, **TypeScript** e **NativeWind v4** (Tailwind CSS).

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
- **Web** — pressiona `w` no terminal para abrir no browser

A app carrega diretamente no telemóvel/browser. Qualquer mudança no código atualiza automaticamente (hot reload).

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
| `filteredGames.test.ts` | Filtragem de jogos (matches) por grupo/estado |
| `saveSetLogic.test.ts` | Lógica de validação e gravação de sets |
| `bracketPropagation.test.ts` | Propagação de resultados no bracket eliminatório |

## Versão

A versão é gerida a partir de `package.json`. Um script `postversion` sincroniza automaticamente o `app.json`.

```bash
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
```

## Compilar APK (Android)

Usa o [EAS Build](https://docs.expo.dev/build/introduction/) (gratuito, compila na cloud).

### Setup (uma única vez)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Criar conta / fazer login (gratuito)
eas login
```

### Gerar APK

```bash
npm run build:apk
```

Após a build terminar, o terminal mostra um link para descarregar o `.apk`.

### Instalar no telemóvel

1. Transfere o `.apk` para o telemóvel (cabo USB, Google Drive, email, etc.)
2. Abre o ficheiro no telemóvel
3. Ativa **"Instalar de fontes desconhecidas"** se solicitado
4. Instala e abre a app

## Estrutura do projeto

```
src/
├── components/     Componentes reutilizáveis
│   ├── Breadcrumb        Navegação breadcrumb
│   ├── Button            Botão com gradiente
│   ├── Layout            Container, Grid e GridItem responsivos
│   ├── LiveDot           Indicador de jogo a decorrer
│   ├── MatchCard         Card de jogo com resultado
│   ├── SubBadge          Badge de categoria (M/F/MX)
│   └── TeamMatchesSheet  Bottom sheet com jogos de uma equipa
│
├── screens/        Um ficheiro por ecrã (21 ecrãs)
│   ├── HomeScreen                  Lista de torneios
│   ├── CreateTournamentScreen      Criar novo torneio
│   ├── EditTournamentScreen        Editar torneio existente
│   ├── TournamentDetailScreen      Detalhe com categorias
│   ├── CategoryHubScreen           Hub de uma categoria
│   ├── ConfigureCategoryScreen     Configurar categoria
│   ├── TeamListScreen              Lista de equipas
│   ├── ManageTeamScreen            Adicionar/editar equipa
│   ├── GroupsTableScreen           Tabela classificativa
│   ├── GroupsGamesScreen           Lista de jogos do grupo
│   ├── GroupsEmptyScreen           Placeholder sem grupos
│   ├── EnterResultScreen           Introduzir resultado set a set
│   ├── EditMatchScreen             Editar jogo
│   ├── MatchPausedScreen           Jogo pausado
│   ├── KnockoutScreen              Bracket eliminatório
│   ├── PodiumScreen                Pódio final
│   ├── FinishedTournamentScreen    Torneio terminado
│   ├── ConfirmCloseMatchScreen     Confirmar fecho de jogo
│   ├── ConfirmCloseCategoryScreen  Confirmar fecho de categoria
│   ├── WithdrawConfirmScreen       Confirmar desistência
│   └── ExportScreen                Exportar dados
│
├── navigation/     Stack navigator (React Navigation)
├── theme/          Cores e gradientes (usado por NativeWind/Tailwind)
├── types/          TypeScript types (Tournament, Team, Match, Category, etc.)
├── utils/          Lógica de negócio e helpers
│   ├── scoring          Cálculo de classificações
│   ├── categoryConfig   Config por tipo de categoria (label/emoji/cor/gradiente)
│   ├── avatarUtils      Geração de avatares para equipas
│   ├── dateUtils        Formatação de datas
│   ├── labels           Labels reutilizáveis (nomes de rondas, etc.)
│   ├── resolveMatch     Resolução de resultados de jogos
│   ├── constants        Meses PT e constantes
│   └── groupColors      Cores por grupo
│
├── mock/           Dados mock (sem backend)
└── __tests__/      Testes unitários (Jest)
```

## Stack tecnológica

| Tecnologia | Utilização |
|---|---|
| React Native 0.81 | Framework mobile + web |
| Expo SDK 54 | Toolchain e builds |
| TypeScript 5 | Tipagem estática |
| NativeWind 4 | Tailwind CSS para React Native (styling responsivo) |
| React Navigation 7 | Navegação stack |
| expo-linear-gradient | Gradientes nos botões e headers |
| Jest + ts-jest | Testes unitários |
| Reanimated 4 | Animações |

## Notas

- Todos os dados são **mock** (sem backend) — ver `src/mock/data.ts`
- A navegação usa **route params** para passar IDs entre ecrãs (tournamentId → categoryId → matchId)
- Categorias suportadas: **Masculino (M)**, **Feminino (F)** e **Misto (MX)**, cada uma com níveis de 1 a 6
- O styling usa **NativeWind v4** (Tailwind CSS) com classes responsivas (`md:`, `lg:`) — config em `tailwind.config.ts`
- Layout responsivo via componentes `Container`, `Grid` e `GridItem` em `src/components/Layout.tsx`
- Os tipos `Match` (antigo `Game`) e `Category` (antigo `Vertente`) refletem a terminologia atual do domínio
