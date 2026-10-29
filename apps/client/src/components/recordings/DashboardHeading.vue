<script setup lang="ts">
import { formatSize } from '@/utils/format';

defineProps<{ count: number; totalBytes: number; hasMore: boolean }>();
</script>

<template>
  <section class="dashboard-heading">
    <div>
      <span class="eyebrow">YOUR PRIVATE LISTENING SPACE</span>
      <h1>Dashboard<span class="dashboard-heading__dot">.</span></h1>
      <p>Pick up where you left off, or find your next listen.</p>
    </div>
    <div class="dashboard-heading__stats">
      <strong>{{ count }}{{ hasMore ? '+' : '' }}</strong>
      <span>{{ count === 1 && !hasMore ? 'file' : 'files' }} · {{ formatSize(totalBytes) }}{{ hasMore ? '+' : '' }}</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.dashboard-heading__dot {
  color: tokens.$color-accent;
}

.dashboard-heading {
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

.dashboard-heading__stats {
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
