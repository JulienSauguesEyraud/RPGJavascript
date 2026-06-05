<script>
  import { gameState, myPlayerId } from '../stores/gameState.js'
  import { selectedAction } from '../stores/gameUi.js'

  const COOLDOWN_MOVE   = $derived(me?.cooldownMove   ?? 3000)
  const COOLDOWN_ATTACK = $derived(me?.cooldownAttack ?? 5000)
  const EVENT_INTERVAL  = 20000
  const EVENT_DURATION  = 5000

  let now = $state(Date.now())
  setInterval(() => { now = Date.now() }, 100)

  const me = $derived($gameState?.entities?.[$myPlayerId])

  function cooldownMove() {
    if (!me) return 0
    return Math.max(0, COOLDOWN_MOVE - (now - (me.lastMoved ?? 0)))
  }
  function cooldownAttack() {
    if (!me) return 0
    return Math.max(0, COOLDOWN_ATTACK - (now - (me.lastAttacked ?? 0)))
  }
  function timeUntilEvent() {
    const state = $gameState
    if (!state || state.activeEvent) return 0
    return Math.max(0, EVENT_INTERVAL - (now - (state.lastEventAt ?? 0)))
  }
  function timeLeftEvent() {
    const state = $gameState
    if (!state?.activeEvent) return 0
    return Math.max(0, EVENT_DURATION - (now - (state.activeEvent.startedAt ?? 0)))
  }

  function choose(action) { selectedAction.set(action) }
</script>

<div class="lastLog">{$gameState.log[$gameState.log.length - 1]}</div>

<div class="hud">
  <div class="stats">
    <div>
      <strong>Joueur 1</strong> [{$gameState?.entities?.player1?.className ?? ''}]
      HP: {$gameState?.entities?.player1?.hp}/{$gameState?.entities?.player1?.maxHp}
      MP: {$gameState?.entities?.player1?.mp}/{$gameState?.entities?.player1?.maxMp}
    </div>
    <div>
      <strong>Joueur 2</strong> [{$gameState?.entities?.player2?.className ?? ''}]
      HP: {$gameState?.entities?.player2?.hp}/{$gameState?.entities?.player2?.maxHp}
      MP: {$gameState?.entities?.player2?.mp}/{$gameState?.entities?.player2?.maxMp}
    </div>
    <div class="event-zone">
      {#if $gameState?.activeEvent}
        <span class="event-active">{$gameState.activeEvent.type} — {(timeLeftEvent() / 1000).toFixed(1)}s</span>
        <div class="bar"><div class="bar-fill event" style="width:{(timeLeftEvent()/EVENT_DURATION)*100}%"></div></div>
      {:else}
        <span class="event-waiting">Prochain événement dans {(timeUntilEvent()/1000).toFixed(0)}s</span>
        <div class="bar"><div class="bar-fill next-event" style="width:{(1 - timeUntilEvent()/EVENT_INTERVAL)*100}%"></div></div>
      {/if}
    </div>
  </div>

  <div class="actions">
    <div class="action-btn">
      <button
              class:active={$selectedAction === 'move'}
              disabled={cooldownMove() > 0}
              onclick={() => choose('move')}
      >Déplacer</button>
      <div class="bar">
        <div class="bar-fill move" style="width:{(cooldownMove()/COOLDOWN_MOVE)*100}%"></div>
      </div>
      {#if cooldownMove() > 0}<span class="cd-label">{(cooldownMove()/1000).toFixed(1)}s</span>{/if}
    </div>

    <div class="action-btn">
      <button
              class:active={$selectedAction === 'melee'}
              disabled={cooldownAttack() > 0}
              onclick={() => choose('melee')}
      >Corps à corps</button>
      <p>(MP:0/Portée:1)</p>
      <div class="bar">
        <div class="bar-fill attack" style="width:{(cooldownAttack()/COOLDOWN_ATTACK)*100}%"></div>
      </div>
      {#if cooldownAttack() > 0}<span class="cd-label">{(cooldownAttack()/1000).toFixed(1)}s</span>{/if}
    </div>

    <div class="action-btn">
      <div class="magicAttacks">
        <button
                class:active={$selectedAction === 'fireball'}
                disabled={cooldownAttack() > 0}
                onclick={() => choose('fireball')}
        >Boule de feu</button>
        <p>(MP:4/Portée:2)</p>
        <button
                class:active={$selectedAction === 'thunder'}
                disabled={cooldownAttack() > 0}
                onclick={() => choose('thunder')}
        >Tonnerre</button>
        <p>(MP:10/Portée:∞)</p>
      </div>
      <div class="bar">
        <div class="bar-fill attack" style="width:{(cooldownAttack()/COOLDOWN_ATTACK)*100}%"></div>
      </div>
      {#if cooldownAttack() > 0}<span class="cd-label">{(cooldownAttack()/1000).toFixed(1)}s</span>{/if}
    </div>
  </div>

  <div class="log">
    {#each ($gameState?.log ?? []).slice(-7) as entry}
      <div>{entry}</div>
    {/each}
  </div>
</div>

<style>
  .hud {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    background: rgba(0,0,0,0.75);
    min-height: 140px;
    gap: 10px
  }
  .stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .event-active {
    color: #ffd37a;
    font-weight: bold;
    font-size: 12px;
  }
  .event-waiting {
    opacity: 0.5;
    font-size: 12px;
  }
  .bar {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    margin-top: 2px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.1s linear;
  }
  .bar-fill.move        { background: #296f21; }
  .bar-fill.attack      { background: #8c20cc; }
  .bar-fill.event       { background: #ffd37a; }
  .bar-fill.next-event  { background: rgba(255,211,122,0.3); }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .action-btn {
    min-width: 90px;
  }
  .action-btn p {
    margin: 0;
    font-size: 12px;
    color: rgba(255,255,255,0.65);
    pointer-events: none;
  }

  .magicAttacks {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .magicAttacks button {
    margin-top: 8px;
  }

  .actions button {
    width: 100%;
    padding: 6px 10px;
    height: 30px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.2);
    background: #263244;
    color: white;
    cursor: pointer;
  }
  .actions button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .actions button.active {
    background: #0f5f7a;
    border-color: #7dd3fc;
  }
  .cd-label {
    display: block;
    font-size: 10px;
    opacity: 0.7;
    text-align: center;
    pointer-events: none;
  }
  .log {
    font-size: 12px;
    opacity: 0.9;
    padding-left: 6px;
    overflow: hidden;
  }
  .log > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lastLog {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.5);
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    pointer-events: none;
  }
</style>