// src/services/api.ts
// Mock flag — set to false when real API is ready
const USE_MOCK = true;
const API_BASE = 'https://api.matchr.app/v1';
const MOCK_DELAY = 300;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

import { Tournament, Vertente, Team, Game } from '../types';
import { mockTournaments, mockGames } from '../mock/data';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getTournaments(): Promise<Tournament[]> {
  if (USE_MOCK) { await delay(MOCK_DELAY); return mockTournaments; }
  return apiFetch<Tournament[]>('/tournaments');
}

export async function getTournament(id: string): Promise<Tournament | null> {
  if (USE_MOCK) { await delay(MOCK_DELAY); return mockTournaments.find(t => t.id === id) ?? null; }
  return apiFetch<Tournament>(`/tournaments/${id}`);
}

export async function getGames(vertenteId: string): Promise<Game[]> {
  if (USE_MOCK) { await delay(MOCK_DELAY); return mockGames; }
  return apiFetch<Game[]>(`/vertentes/${vertenteId}/games`);
}

export async function submitResult(gameId: string, sets: Array<{team1: number; team2: number}>): Promise<void> {
  if (USE_MOCK) { await delay(MOCK_DELAY); return; }
  await apiFetch(`/games/${gameId}/result`, { method: 'POST', body: JSON.stringify({ sets }) });
}

export async function pauseGame(gameId: string): Promise<void> {
  if (USE_MOCK) { await delay(MOCK_DELAY); return; }
  await apiFetch(`/games/${gameId}/pause`, { method: 'POST' });
}

export async function updateGame(gameId: string, data: Partial<Game>): Promise<void> {
  if (USE_MOCK) { await delay(MOCK_DELAY); return; }
  await apiFetch(`/games/${gameId}`, { method: 'PATCH', body: JSON.stringify(data) });
}
