<script setup lang="ts">
import { formatSize } from '../../utils/format';

defineProps<{ count: number; totalBytes: number; hasMore: boolean }>();
</script>

<template>
  <section class="library-heading">
    <div>
      <span class="eyebrow">TWOJA PRYWATNA PRZESTRZEŃ</span>
      <h1>Biblioteka<span class="brand-dot">.</span></h1>
      <p>Wszystkie Twoje brzmienia w jednym miejscu.</p>
    </div>
    <div class="library-stats">
      <strong>{{ count }}{{ hasMore ? '+' : '' }}</strong>
      <span>nagrań · {{ formatSize(totalBytes) }}{{ hasMore ? '+' : '' }}</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as tokens;
@use '../../styles/mixins' as mixins;

.library-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$space-4;
  margin-bottom: tokens.$space-9;

  .eyebrow {
    margin-bottom: 15px;
  }

  h1 {
    margin-bottom: 10px;
    font-size: 43px;
    letter-spacing: -1.5px;
  }

  p {
    margin: 0;
    font-size: tokens.$font-size-md;
  }

  @include mixins.mobile {
    .eyebrow {
      font-size: 8px;
    }

    h1 {
      font-size: 34px;
    }

    p {
      font-size: tokens.$font-size-sm;
    }
  }
}

.library-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: right;

  strong {
    font-size: 36px;
    font-weight: tokens.$font-weight-medium;
  }

  span {
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-sm;
  }

  @include mixins.mobile {
    strong {
      font-size: 29px;
    }

    span {
      font-size: tokens.$font-size-2xs;
    }
  }
}
</style>
