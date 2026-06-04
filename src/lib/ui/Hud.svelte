<script>
  import { dispatch, gameState, myPlayerId } from '../stores/gameState.js'
  import { selectedAction } from '../stores/gameUi.js'

  const currentPlayer = $derived($gameState?.entities?.[$gameState?.turn])
  const isMyTurn = $derived($gameState?.turn === $myPlayerId)

  function choose(action) {
    selectedAction.set(action)
  }

  function handlePass() {
    dispatch({ type: 'PASS', payload: { id: $gameState.turn } })
  }
</script>

<div class="hud">
  <div class="stats">
    <div><strong>Joueur1</strong> HP: {$gameState.entities.player1.hp}/{$gameState.entities.player1.maxHp} MP: {$gameState.entities.player1.mp}</div>
    <div><strong>Joueur2</strong> HP: {$gameState.entities.player2.hp}/{$gameState.entities.player2.maxHp} MP: {$gameState.entities.player2.mp}</div>
    <div>Tour: {$gameState.turn}</div>
  </div>
  {#if !isMyTurn}
    <div class="waiting">En attente de l'adversaire…</div>
  {:else}
  <div class="actions">
    <button
      class:active={$selectedAction === 'move'}
      disabled={currentPlayer.hasMoved}
      onclick={() => choose('move')}
    >Déplacer</button>
    <button
      class:active={$selectedAction === 'melee'}
      disabled={currentPlayer.hasAttacked}
      onclick={() => choose('melee')}
    >Corps à corps</button>
    <button
      class:active={$selectedAction === 'magic'}
      disabled={currentPlayer.hasAttacked}
      onclick={() => choose('magic')}
    >Magie</button>
    <button disabled={!isMyTurn} onclick={handlePass}>Passer</button>
  </div>
  {/if}
    <div class="log">
    {#each ($gameState?.log ?? []).slice(-5) as entry}
      <div class="log-line">{entry}</div>
    {/each}
  </div>
</div>

<style>
.hud {
  display: grid;
  grid-template-columns: 1fr auto 1fr;

  width: 100%;
  height: 100px;

  padding: 10px 14px;
  box-sizing: border-box;

  background: rgba(0, 0, 0, 0.75);
  color: white;

  overflow: hidden;

  align-items: stretch;
  gap: 12px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;

  font-size: 13px;
  min-width: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  align-content: center;
  justify-content: center;

  height: fit-content;
  align-self: center;
}

.actions button {
  padding: 6px 10px;
  height: 30px;
  line-height: 1;

  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.2);

  background: #263244;
  color: white;

  cursor: pointer;

  flex: 0 0 auto;
}

.actions button:disabled {
  opacity: 0.4;
}

.actions button.active {
  background: #0f5f7a;
  border-color: #7dd3fc;
}

.log {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  height: 100%;
  min-height: 0;

  overflow-y: auto;

  font-size: 12px;
  opacity: 0.9;

  padding-left: 6px;

  border-left: 1px solid rgba(255,255,255,0.08);
}

.log > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 700px) {
  .hud {
    grid-template-columns: 1fr;
    height: 180px;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>