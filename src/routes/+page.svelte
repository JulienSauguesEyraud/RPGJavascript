<script>
  import { onMount } from 'svelte'
  import { gameState, dispatch, myPlayerId,
    roomCode, lobbyStatus, lobbyError,
    createRoom, joinRoom } from '../lib/stores/gameState.js'
  import { selectedAction } from '../lib/stores/gameUi.js'
  import { initGameCanvas } from '../lib/render/canvas.js'
  import { CLASSES } from '../lib/game/classes.js'
  import Hud from '../lib/ui/Hud.svelte'

  let canvas
  let stateGame
  let ui = { selected: 'move', hover: null, playerId: null }
  let selectedClass = $state('warrior')
  let joinCode = $state('')

  const unsub    = gameState.subscribe(v => { stateGame = v })
  const unsubSel = selectedAction.subscribe(v => { ui.selected = v })
  const unsubId  = myPlayerId.subscribe(v => { ui.playerId = v })

  onMount(() => {
    const api = initGameCanvas(canvas, () => stateGame, dispatch, ui)
    requestAnimationFrame(() => api.resize())
    return () => { api.destroy(); unsub(); unsubSel(); unsubId() }
  })
</script>

{#if $lobbyStatus !== 'playing'}
  <div class="lobby">
    <h1>RPG Tactics</h1>

    {#if $lobbyStatus === 'idle' || $lobbyStatus === 'error'}

      <!-- Sélection de classe -->
      <p class="section-title">Choisir une classe</p>
      <div class="class-cards">
        {#each Object.entries(CLASSES) as [key, cls]}
          <button
                  class="class-card"
                  class:selected={selectedClass === key}
                  onclick={() => selectedClass = key}
          >
            <strong>{cls.label}</strong>
            <span>{cls.description}</span>
          </button>
        {/each}
      </div>

      <div class="lobby-actions">
        <button onclick={() => createRoom(selectedClass)}>Créer une partie</button>
        <div class="join-row">
          <input
                  bind:value={joinCode}
                  placeholder="Code"
                  maxlength="5"
          />
          <button onclick={() => joinRoom(joinCode, selectedClass)}>Rejoindre</button>
        </div>
        {#if $lobbyError}<p class="error">{$lobbyError}</p>{/if}
      </div>
    {/if}

    {#if $lobbyStatus === 'waiting'}
      <div class="waiting">
        <p>Partie créée !</p>
        <p class="code">{$roomCode}</p>
        <p class="hint">Donne ce code à ton adversaire</p>
        <button onclick={() => navigator.clipboard.writeText($roomCode)}>Copier</button>
      </div>
    {/if}
  </div>
{/if}

<div class="page" class:hidden={$lobbyStatus !== 'playing'}>
  {#if $roomCode}
    <div class="room-badge">Room : <strong>{$roomCode}</strong></div>
  {/if}
  <div class="arena">
    <canvas bind:this={canvas}></canvas>
  </div>
  <Hud />
</div>

<style>
  :global(html), :global(body) {
    margin: 0;
    width: 100%;
    height: 100%;
    background: #111;
    color: white;
    font-family: sans-serif;
  }
  .page.hidden { display: none; }

  .lobby {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    gap: 24px;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0;
  }

  .lobby-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .join-row {
    display: flex;
    gap: 8px;
  }

  input {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.2);
    background: #263244;
    color: white;
    font-size: 1rem;
    text-transform: uppercase;
    width: 120px;
    text-align: center;
    letter-spacing: 4px;
  }

  button {
    padding: 10px 20px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.2);
    background: #0f5f7a;
    color: white;
    font-size: 1rem;
    cursor: pointer;
  }
  button:hover {
    background: #1a7a9a;
  }

  .waiting {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .code {
    font-size: 3rem;
    font-weight: bold;
    letter-spacing: 10px;
    color: #7dd3fc;
  }

  .hint {
    opacity: 0.6;
    font-size: 0.9rem;
  }
  .error {
    color: #f87171;
  }

  .page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
  }

  .arena {
    display: grid;
    flex: 1 1 auto;
    min-height: 0;
    padding: clamp(8px, 2vw, 20px);
    place-items: center;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    background: #001;
  }
  .room-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.6);
  color: #7dd3fc;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(125, 211, 252, 0.25);
  pointer-events: none;
}
  .section-title { margin: 0 0 8px; opacity: 0.7; font-size: 0.9rem; text-align: center; }

  .class-cards {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .class-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 140px;
    padding: 14px 10px;
    border-radius: 8px;
    border: 2px solid rgba(255,255,255,0.15);
    background: #1a2535;
    color: white;
    cursor: pointer;
    font-size: 0.82rem;
    text-align: center;
    transition: border-color 0.15s;
  }
  .class-card strong { font-size: 1rem; }
  .class-card span { opacity: 0.65; line-height: 1.3; }
  .class-card.selected {
    border-color: #7dd3fc;
    background: #0f3a52;
  }
  .class-card:hover { border-color: rgba(125,211,252,0.5); }

</style>