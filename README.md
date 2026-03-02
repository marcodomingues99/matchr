# Matchr — Setup & Compilação

## Pré-requisitos
- Node.js 18+ instalado → https://nodejs.org
- Expo Go no teu telemóvel (App Store ou Google Play)

## Como correr

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npx expo start
```

Aparece um QR code no terminal.

**No telemóvel:**
- iOS → abre a câmara e aponta para o QR code
- Android → abre o Expo Go e faz scan do QR code

A app carrega diretamente no teu telemóvel. Qualquer mudança no código atualiza automaticamente.

## Para compilar APK (Android)

```bash
npx eas build -p android --profile preview
```

## Para compilar IPA (iOS)

```bash
npx eas build -p ios --profile preview
```

> Para compilar para iOS precisas de uma conta Apple Developer ($99/ano).

## Estrutura do projeto

```
src/
├── theme/       → cores, tipografia, espaçamentos
├── types/       → TypeScript types e navegação
├── mock/        → dados de exemplo
├── navigation/  → stack de navegação
├── components/  → Header, GameCard, SubBadge, Button
└── screens/     → um ficheiro por ecrã
```

## Ecrãs implementados completamente
- HomeScreen — lista de torneios
- TournamentDetailScreen — detalhe com sub-torneios
- GroupsGamesScreen — lista de jogos com GameCard
- EnterResultScreen — introdução de resultado set a set

## Ecrãs com stub (🚧 a implementar)
Os restantes ecrãs têm a estrutura criada e mostram "Em desenvolvimento".
Implementa cada um com base no ficheiro matchr.html como referência visual.
