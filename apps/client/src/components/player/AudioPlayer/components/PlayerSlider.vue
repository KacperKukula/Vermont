<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  value: number;
  max: number;
  step: number;
  label: string;
  valueText: string;
  disabled?: boolean;
  compact?: boolean;
}>(), { disabled: false, compact: false });
const emit = defineEmits<{ change: [value: number] }>();
const fill = computed(() => props.max > 0 ? Math.min(100, Math.max(0, props.value / props.max * 100)) : 0);
</script>

<template>
  <input
    class="player-slider"
    :class="{ 'player-slider--volume': compact }"
    type="range"
    min="0"
    :max="max"
    :step="step"
    :value="value"
    :disabled="disabled"
    :style="{ '--fill': fill + '%' }"
    :aria-label="label"
    :aria-valuetext="valueText"
    @input="emit('change', Number(($event.target as HTMLInputElement).value))"
  />
</template>

<style scoped lang="scss">
.player-slider {
  --fill: 0%;
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 24px;
  margin: 0;
  // Reset global text-field padding so the thumb and painted track share an origin.
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
  border: 0;
  border-radius: 0;
  // Inset the painted track by half the thumb width to match its travel at every value.
  background: linear-gradient(to right, tokens.$color-accent var(--fill), #ffffff24 var(--fill)) center / calc(100% - 12px) 4px no-repeat;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 4px;
    border: 0;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    width: 12px;
    height: 12px;
    margin-top: -4px;
    -webkit-appearance: none;
    appearance: none;
    border: 0;
    border-radius: 50%;
    background: tokens.$color-text;
    box-shadow: 0 1px 5px #00000040;
  }

  &::-moz-range-track {
    height: 4px;
    border: 0;
    background: transparent;
  }

  &::-moz-range-progress {
    background: transparent;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 0;
    border-radius: 50%;
    background: tokens.$color-text;
    box-shadow: 0 1px 5px #00000040;
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &--volume { width: 80px; }

  @include mixins.tablet {
    &--volume { width: 56px; }
  }

  @include mixins.mobile {
    &--volume { display: none; }
  }
}
</style>
