<template>
  <button class="player-button" type="button"><slot /></button>
</template>

<style scoped lang="scss">
.player-button {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 8px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: tokens.$color-text-muted;
  transition: background tokens.$transition-fast, color tokens.$transition-fast;

  :deep(svg) { width: 20px; height: 20px; }

  &:hover:not(:disabled) {
    background: #ffffff0d;
    color: tokens.$color-text;
  }

  &:disabled { opacity: 0.3; }

  &--play {
    width: 44px;
    height: 44px;
    border: 1px solid #b8f5c747;
    background: linear-gradient(145deg, #70d186, tokens.$color-accent);
    color: tokens.$color-on-accent;
    box-shadow: 0 4px 18px #45b85e26, inset 0 1px 0 #ffffff35;

    &:hover:not(:disabled) {
      background: linear-gradient(145deg, #87df9b, tokens.$color-accent);
      color: tokens.$color-on-accent;
      box-shadow: 0 0 0 4px #45b85e15, 0 4px 20px #45b85e30;
    }
  }

}
</style>
