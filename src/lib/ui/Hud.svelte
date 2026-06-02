<script>
  import { dispatch, gameState, resetGame } from '../stores/gameState.js'
  import { selectedAction } from '../stores/gameUi.js'

  const isPlayerTurn = $derived($gameState.turn === 'player')
  const player = $derived($gameState.entities.player)

  function choose(action) {
    selectedAction.set(action)
  }

  function handleReset() {
    resetGame()
  }

  function handlePass() {
    dispatch({ type: 'PASS', payload: { id: 'player' } })
  }
</script>

<div class="hud">
  <div class="stats">
    <div><strong>Joueur</strong> HP: {$gameState.entities.player.hp}/{$gameState.entities.player.maxHp} MP: {$gameState.entities.player.mp}</div>
    <div><strong>Mannequin</strong> HP: {$gameState.entities.dummy.hp}/{$gameState.entities.dummy.maxHp}</div>
    <div>Tour: {$gameState.turn}</div>
  </div>
  <div class="actions">
    <button
      class:active={$selectedAction === 'move'}
      disabled={!isPlayerTurn || player.hasMoved}
      onclick={() => choose('move')}
    >Déplacer</button>
    <button
      class:active={$selectedAction === 'melee'}
      disabled={!isPlayerTurn || player.hasAttacked}
      onclick={() => choose('melee')}
    >Corps à corps</button>
    <button
      class:active={$selectedAction === 'magic'}
      disabled={!isPlayerTurn || player.hasAttacked}
      onclick={() => choose('magic')}
    >Magie</button>
    <button disabled={!isPlayerTurn} onclick={handlePass}>Passer</button>
    <button onclick={handleReset}>Réinitialiser</button>
  </div>
  <div class="log">
    {#each $gameState.log.slice(-5) as entry}
      <div class="log-line">{entry}</div>
    {/each}
  </div>
</div>

<style>
.hud {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto minmax(180px, 1fr);
  gap: 10px;
  align-items: center;
  flex: 0 0 auto;
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  padding: 10px clamp(8px, 2vw, 18px);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  min-width: 0;
  font-size: clamp(12px, 1.6vw, 15px);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.actions button {
  min-height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 6px;
  background: #263244;
  color: #fff;
  padding: 0 10px;
  font-size: clamp(12px, 1.5vw, 14px);
}

.actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.actions button.active {
  border-color: #7dd3fc;
  background: #0f5f7a;
  box-shadow: 0 0 0 2px rgba(125, 211, 252, 0.22);
}

.log {
  min-width: 0;
  max-height: 96px;
  overflow: auto;
  font-size: clamp(11px, 1.4vw, 13px);
}

.log-line {
  overflow-wrap: anywhere;
  opacity: 0.9;
}

@media (max-width: 820px) {
  .hud {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .hud {
    gap: 8px;
    padding-block: 8px;
  }

  .actions button {
    flex: 1 1 calc(50% - 6px);
    padding: 0 8px;
  }
}
</style>
