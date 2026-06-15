<script>
  import { gameState, myPlayerId, getPlayersList } from '../stores/gameState.js'
  import { selectedAction } from '../stores/gameUi.js'
  import NoManaIcon from './NoManaIcon.svelte' // Import de l'icône

  // Coûts en MP des compétences magiques
  const MP_FIREBALL = 4
  const MP_THUNDER = 10
  const MP_TELEPORT = 5

  const COOLDOWN_MOVE = $derived(me?.cooldownMove ?? 3000)
  const COOLDOWN_ATTACK = $derived(me?.cooldownAttack ?? 5000)
  const EVENT_INTERVAL = 20000
  const EVENT_DURATION = 5000

  let now = $state(Date.now())
  setInterval(() => { now = Date.now() }, 100)

  const me = $derived($gameState?.entities?.[$myPlayerId])
  const activeEvent = $derived($gameState?.activeEvent)
  const lastEventAt = $derived($gameState?.lastEventAt ?? 0)
  const gameLogs = $derived($gameState?.log ?? [])
  const players = $derived(getPlayersList($gameState))

  function cooldownMove() {
    if (!me) return 0
    return Math.max(0, COOLDOWN_MOVE - (now - (me.lastMoved ?? 0)))
  }

  function cooldownAttack() {
    if (!me) return 0
    return Math.max(0, COOLDOWN_ATTACK - (now - (me.lastAttacked ?? 0)))
  }

  function timeUntilEvent() {
    if (!$gameState || activeEvent) return 0
    return Math.max(0, EVENT_INTERVAL - (now - lastEventAt))
  }

  function timeLeftEvent() {
    if (!activeEvent) return 0
    return Math.max(0, EVENT_DURATION - (now - (activeEvent.startedAt ?? 0)))
  }

  function choose(action) { selectedAction.set(action) }
</script>

<div class="lastLog">{gameLogs[gameLogs.length - 1]}</div>

<div class="hud">
  <div class="stats">
    <div class="players-grid">
      {#each players as player}
        <div class="player-card" class:is-me={player.id === $myPlayerId}>
          <div class="player-header">
            <strong>{player.id}</strong>
            <span class="player-class">[{player.className}]</span>
          </div>

          <div class="gauge-container">
            <input
                    type="range"
                    min="0"
                    max={player.maxHp}
                    value={player.hp}
                    disabled
                    style="--pct: {Math.min(100, (player.hp / player.maxHp) * 100)}%"
                    class="gauge-range hp"
            />
            <span class="gauge-label">HP: {player.hp}/{player.maxHp}</span>
          </div>

          <div class="gauge-container">
            <input
                    type="range"
                    min="0"
                    max={player.maxMp}
                    value={player.mp}
                    disabled
                    style="--pct: {Math.min(100, (player.mp / player.maxMp) * 100)}%"
                    class="gauge-range mp"
            />
            <span class="gauge-label">MP: {player.mp}/{player.maxMp}</span>
          </div>
        </div>
      {/each}
    </div>
    <div class="event-zone">
      {#if activeEvent}
        <span class="event-active">{activeEvent.type} — {(timeLeftEvent() / 1000).toFixed(1)}s</span>
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
              disabled={cooldownMove() > 0 || !me }
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
              disabled={cooldownAttack() > 0 || !me }
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
        <div class="btn-wrapper">
          <button
                  class:active={$selectedAction === 'fireball'}
                  disabled={cooldownAttack() > 0 || !me || (me?.mp ?? 0) < MP_FIREBALL}
                  onclick={() => choose('fireball')}
          >
            Boule de feu
          </button>
          {#if me && me.mp < MP_FIREBALL}
            <NoManaIcon />
          {/if}
        </div>
        <p>(MP:{MP_FIREBALL}/Portée:2)</p>

        <div class="btn-wrapper">
          <button
                  class:active={$selectedAction === 'thunder'}
                  disabled={cooldownAttack() > 0|| !me || (me?.mp ?? 0) < MP_THUNDER}
                  onclick={() => choose('thunder')}
          >
            Tonnerre
          </button>
          {#if me && me.mp < MP_THUNDER}
            <NoManaIcon />
          {/if}
        </div>
        <p>(MP:{MP_THUNDER}/Portée:∞)</p>

        <div class="btn-wrapper">
          <button
                  class:active={$selectedAction === 'teleport'}
                  disabled={cooldownAttack() > 0 || !me || (me?.mp ?? 0) < MP_TELEPORT}
                  onclick={() => choose('teleport')}
          >
            Téléportation
          </button>
          {#if me && me.mp < MP_TELEPORT}
            <NoManaIcon />
          {/if}
        </div>
        <p>(MP:{MP_TELEPORT}/Portée:∞)</p>
      </div>
      <div class="bar">
        <div class="bar-fill attack" style="width:{(cooldownAttack()/COOLDOWN_ATTACK)*100}%"></div>
      </div>
      {#if cooldownAttack() > 0}<span class="cd-label">{(cooldownAttack()/1000).toFixed(1)}s</span>{/if}
    </div>
  </div>

  <div class="log">
    {#each gameLogs.slice(-7) as entry}
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
    min-height: 170px;
    gap: 10px
  }
  .stats {
    display: flex;
    flex-direction: column;
  }

  .players-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .player-card {
    background: rgba(255,255,255,0.1);
    padding: 6px;
    border-radius: 4px;
  }
  .player-card.is-me {
    border-left: 3px solid transparent;
    border-left-color: #4cf;
    background: rgba(76,204,255,0.1);
  }
  .player-header {
    font-size: 13px;
    margin-bottom: 2px;
  }

  .player-class {
    opacity: 0.6;
  }

  .gauge-container {
    position: relative;
    display: flex;
    align-items: center;
    height: 14px;
    margin-top: 3px;
  }

  .gauge-range {
    width: 100%;
    height: 100%;
    border-radius: 3px;
  }

  .gauge-range.hp {
    background: linear-gradient(to right, #ef4444 var(--pct), rgba(0, 0, 0, 0.4) var(--pct));
  }
  .gauge-range.mp {
    background: linear-gradient(to right, #20ccc6 var(--pct), rgba(0, 0, 0, 0.4) var(--pct));
  }

  .gauge-range::-moz-range-thumb {
    width: 0;
    height: 0;
    border: none;
  }

  .gauge-label {
    position: absolute;
    left: 6px;
    font-size: 8px;
    font-weight: bold;
    text-shadow: 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000;
    pointer-events: none;
  }

  .event-active {
    color: #ffd37a;
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 5px;
  }
  .event-waiting {
    opacity: 0.5;
    font-size: 12px;
    margin-bottom: 5px;
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
    display: block;
    text-align: center;
  }

  .magicAttacks {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  .btn-wrapper {
    position: relative;
    width: 100%;
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