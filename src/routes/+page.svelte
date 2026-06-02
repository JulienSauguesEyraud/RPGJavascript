<script>
  import { onMount } from 'svelte'
  import { gameState, dispatch } from '../lib/stores/gameState.js'
  import { selectedAction } from '../lib/stores/gameUi.js'
  import { initGameCanvas } from '../lib/render/canvas.js'
  import Hud from '../lib/ui/Hud.svelte'

  let canvas
  let state
  let ui = { selected: 'move', hover: null }

  const unsub = gameState.subscribe(v => { state = v })
  const unsubSel = selectedAction.subscribe(v => { ui.selected = v })

  onMount(() => {
    const getState = () => state
    const uiStores = ui
    const api = initGameCanvas(canvas, getState, dispatch, uiStores)
    return () => {
      api.destroy()
      unsub(); unsubSel()
    }
  })
</script>

<div class="page">
  <div class="arena">
    <canvas bind:this={canvas}></canvas>
  </div>
  <Hud />
</div>

<style>
  :global(html),
  :global(body) {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
    min-height: 0;
    background: #111;
  }

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
</style>
