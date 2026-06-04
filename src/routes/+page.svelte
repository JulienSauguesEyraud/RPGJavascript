<script>
  import { onMount } from 'svelte'
  import { gameState, dispatch,
           roomCode, lobbyStatus, lobbyError,
           createRoom, joinRoom } from '../lib/stores/gameState.js'
  import { selectedAction } from '../lib/stores/gameUi.js'
  import { initGameCanvas } from '../lib/render/canvas.js'
  import Hud from '../lib/ui/Hud.svelte'

  let canvas
  let stateGame
  let ui = { selected: 'move', hover: null }
  let joinInput = $state('')

  const unsub = gameState.subscribe(v => { stateGame = v })
  const unsubSel = selectedAction.subscribe(v => { ui.selected = v })

  onMount(() => {
    const api = initGameCanvas(canvas, () => stateGame, dispatch, ui)
    return () => { api.destroy(); unsub(); unsubSel() }
  })
</script>

<!-- MENU LOBBY -->
{#if $lobbyStatus !== 'playing'}
  <div class="lobby">
    <h1>RPG Tactics</h1>

    {#if $lobbyStatus === 'idle' || $lobbyStatus === 'error'}
      <div class="lobby-actions">
        <button onclick={() => createRoom()}>Créer une partie</button>
        <div class="join-row">
          <input
            bind:value={joinInput}
            placeholder="Code de partie"
            maxlength="5"
          />
          <button onclick={() => joinRoom(joinInput)}>Rejoindre</button>
        </div>
        {#if $lobbyError}
          <p class="error">{$lobbyError}</p>
        {/if}
      </div>
    {/if}

    {#if $lobbyStatus === 'waiting'}
      <div class="waiting">
        <p>Partie créée !</p>
        <p class="code">{$roomCode}</p>
        <p class="hint">Donne ce code à ton adversaire</p>
        <button onclick={() => navigator.clipboard.writeText($roomCode)}>
          Copier le code
        </button>
      </div>
    {/if}
  </div>
{/if}

<!-- ARÈNE -->
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
    margin: 0; width: 100%; height: 100%; overflow: hidden;
    background: #111; color: white;
    font-family: sans-serif;
  }

  .lobby {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    gap: 24px;
  }

  h1 { font-size: 2.5rem; margin: 0; }

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
    padding: 8px 12px;
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
  button:hover { background: #1a7a9a; }

  .waiting {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .code {
    font-size: 3rem;
    font-weight: bold;
    letter-spacing: 10px;
    color: #7dd3fc;
  }

  .hint { opacity: 0.6; font-size: 0.9rem; }
  .error { color: #f87171; }

  .page {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
    min-height: 0;
  }

  .page.hidden { display: none; }

  .arena {
    display: grid;
    flex: 1 1 auto;
    min-height: 0;
    padding: clamp(8px, 2vw, 20px);
    place-items: center;
  }

  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
    background: #001;
  }
  .room-badge {
  position: absolute;
  top: 10px;
  left: 12px;
  background: rgba(0,0,0,0.6);
  color: #7dd3fc;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(125, 211, 252, 0.25);
  z-index: 10;
  pointer-events: none;
}
</style>