<script>
    import { ACTIONS_CONFIG } from '../game/constants.js'

    let { action, active, disabled, cooldown, onclick, children, layout = 'vertical', hideBar = false } = $props()

    const config = ACTIONS_CONFIG[action]
    const maxCooldown = config?.cooldown ?? 3000
    const pct = $derived((cooldown / maxCooldown) * 100)
</script>

<div class="action-btn {layout}">
    <div class="btn-wrapper">
        <button class:active {disabled} {onclick}>
            {config?.label ?? action}
        </button>
        {@render children?.()}
    </div>
    <p>(MP:{config?.mp}/Portée:{config?.range === Infinity ? '∞' : config?.range})</p>
    {#if !hideBar}
        <div class="bar">
            <div class="bar-fill" style="width: {pct}%; background: {config?.barColor};"></div>
        </div>
        {#if cooldown > 0}
            <span class="cd-label">{(cooldown / 1000).toFixed(1)}s</span>
        {/if}
    {/if}
</div>

<style>
    .action-btn.horizontal {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .action-btn.horizontal p {
        white-space: nowrap;
    }
    .action-btn p {
        margin: 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.65);
        text-align: center;
        pointer-events: none;
        min-width: 110px;
    }
    button {
        width: 100%;
        padding: 6px 10px;
        height: 30px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        background: #263244;
        color: white;
        cursor: pointer;
    }
    button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    button.active {
        background: #0f5f7a;
        border-color: #7dd3fc;
    }
    .bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        margin-top: 3px;
    }
    .bar-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.1s linear;
    }

    .btn-wrapper {
        position: relative;
        width: 100%;
    }

    .cd-label {
        display: block;
        font-size: 10px;
        opacity: 0.7;
        text-align: center;
        pointer-events: none;
    }
</style>