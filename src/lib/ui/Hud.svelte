<script>
  import { gameState, myPlayerId, getPlayersList } from '../stores/gameState.js'
  import { selectedAction } from '../stores/gameUi.js'
  import { hasEntityInRange } from '../game/globalUtils.js'
  import { ACTIONS_CONFIG, EVENT_CONFIG } from '../game/constants.js'

  import NoManaIcon from './NoManaIcon.svelte'
  import OutOfRangeIcon from './OutOfRangeIcon.svelte'
  import ActionButton from './ActionButton.svelte'

  let now = $state(Date.now())
  setInterval(() => { now = Date.now() }, 100)

  const me = $derived($gameState?.entities?.[$myPlayerId])
  const activeEvent = $derived($gameState?.activeEvent)
  const lastEventAt = $derived($gameState?.lastEventAt ?? 0)
  const gameLogs = $derived($gameState?.log ?? [])
  const players = $derived(getPlayersList($gameState))

  const cdMove = $derived(me ? Math.max(0, ACTIONS_CONFIG.move.cooldown - (now - (me.lastMoved ?? 0))) : 0)
  const cdAttack = $derived(me ? Math.max(0, ACTIONS_CONFIG.melee.cooldown - (now - (me.lastAttacked ?? 0))) : 0)

  const timeUntilEvent = $derived((!$gameState || activeEvent) ? 0 : Math.max(0, EVENT_CONFIG.INTERVAL - (now - lastEventAt)))
  const timeLeftEvent = $derived(!activeEvent ? 0 : Math.max(0, EVENT_CONFIG.DURATION - (now - (activeEvent.startedAt ?? 0))))

  function choose(action) { selectedAction.set(action) }

  const magicSpells = ['fireball', 'thunder', 'teleport'];
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
            <input type="range" min="0" max={player.maxHp} value={player.hp} disabled
                   style="--pct: {Math.min(100, (player.hp / player.maxHp) * 100)}%" class="gauge-range hp" />
            <span class="gauge-label">HP: {player.hp}/{player.maxHp}</span>
          </div>
          <div class="gauge-container">
            <input type="range" min="0" max={player.maxMp} value={player.mp} disabled
                   style="--pct: {Math.min(100, (player.mp / player.maxMp) * 100)}%" class="gauge-range mp" />
            <span class="gauge-label">MP: {player.mp}/{player.maxMp}</span>
          </div>
        </div>
      {/each}
    </div>
    <div class="event-zone">
      {#if activeEvent}
        <span class="event-active">{activeEvent.type} — {(timeLeftEvent / 1000).toFixed(1)}s</span>
        <div class="bar"><div class="bar-fill event" style="width:{(timeLeftEvent / EVENT_CONFIG.DURATION) * 100}%"></div></div>
      {:else}
        <span class="event-waiting">Prochain événement dans {(timeUntilEvent / 1000).toFixed(0)}s</span>
        <div class="bar"><div class="bar-fill next-event" style="width:{(1 - timeUntilEvent / EVENT_CONFIG.INTERVAL) * 100}%"></div></div>
      {/if}
    </div>
  </div>

  <div class="actions">
    <ActionButton action="move"
                  active={$selectedAction === 'move'}
                  disabled={cdMove > 0 || !me}
                  cooldown={cdMove}
                  onclick={() => choose('move')} />

    <ActionButton action="melee"
                  active={$selectedAction === 'melee'}
                  disabled={cdAttack > 0 || !me || !hasEntityInRange('melee', me, $gameState, $myPlayerId)}
                  cooldown={cdAttack}
                  onclick={() => choose('melee')}>
      {#if me && !hasEntityInRange('melee', me, $gameState, $myPlayerId)}<OutOfRangeIcon />{/if}
    </ActionButton>

    <div class="magic-group">
      <div class="magic-rows">
        {#each magicSpells as spell}
          <ActionButton action={spell}
                        active={$selectedAction === spell}
                        disabled={cdAttack > 0 || !me || me.mp < ACTIONS_CONFIG[spell].mp || (spell === 'fireball' && !hasEntityInRange('fireball', me, $gameState, $myPlayerId))}
                        cooldown={cdAttack}
                        layout="horizontal"
                        hideBar
                        onclick={() => choose(spell)}>
            {#if me && me.mp < ACTIONS_CONFIG[spell].mp}<NoManaIcon />{/if}
            {#if spell === 'fireball' && me && !hasEntityInRange('fireball', me, $gameState, $myPlayerId)}<OutOfRangeIcon />{/if}
          </ActionButton>
        {/each}
      </div>

      <div class="shared-cd">
        <div class="bar">
          <div class="bar-fill" style="width: {(cdAttack / ACTIONS_CONFIG.melee.cooldown) * 100}%; background: {ACTIONS_CONFIG.fireball.barColor};"></div>
        </div>
        {#if cdAttack > 0}
          <span class="cd-label">{(cdAttack / 1000).toFixed(1)}s</span>
        {/if}
      </div>
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
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-top: 2px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  .bar-fill.event { background: #ffd37a; }
  .bar-fill.next-event { background: rgba(255, 211, 122, 0.3); }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .magic-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .shared-cd .cd-label {
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