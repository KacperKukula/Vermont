<script setup lang="ts">
import type { Recording } from '@vermont/contracts';
import { useListeningLibrary } from '@/composables/useListeningLibrary';
import { usePlayer } from '@/composables/usePlayer';

const { recentlyPlayed, categoryOf } = useListeningLibrary();
const player = usePlayer();
const { current, playing, loading } = player;

function play(recording: Recording) {
  player.setQueue(recentlyPlayed.value);
  void player.play(recording);
}
</script>

<template>
  <section class="recent-playlist" aria-labelledby="recently-played-title">
    <div class="recent-playlist__heading">
      <div>
        <span class="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
        <h2 id="recently-played-title">Recently played</h2>
      </div>
      <span class="recent-playlist__count">{{ recentlyPlayed.length }} {{ recentlyPlayed.length === 1 ? 'file' : 'files' }}</span>
    </div>
    <p v-if="!recentlyPlayed.length" class="recent-playlist__empty">
      Play a book or a track to start your recently played playlist.
    </p>
    <ol v-else class="recent-playlist__tracks">
      <li v-for="recording in recentlyPlayed" :key="recording.id">
        <button
          class="recent-playlist__track"
          :class="{ 'recent-playlist__track--active': current?.id === recording.id }"
          :disabled="loading && current?.id === recording.id"
          :aria-label="`${current?.id === recording.id && playing ? 'Pause' : 'Play'} ${recording.title}`"
          @click="play(recording)"
        >
          <span class="recent-playlist__symbol" aria-hidden="true">{{ current?.id === recording.id && playing ? 'Ⅱ' : '▶' }}</span>
          <span class="recent-playlist__info">
            <strong>{{ recording.title }}</strong>
            <span>{{ categoryOf(recording.id) === 'books' ? 'Books' : 'Music' }}</span>
          </span>
        </button>
      </li>
    </ol>
  </section>
</template>

<style scoped lang="scss">
.recent-playlist {
  min-width: 0;
  padding: tokens.$space-6;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-lg;
  background: tokens.$color-surface;

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: tokens.$space-3;

    h2 {
      margin: tokens.$space-2 0 0;
      font-size: tokens.$font-size-xl;
    }

    .eyebrow {
      font-size: tokens.$font-size-2xs;
    }
  }

  &__count {
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-sm;
    white-space: nowrap;
  }

  &__empty {
    margin: tokens.$space-5 0 0;
    font-size: tokens.$font-size-md;
  }

  &__tracks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: tokens.$space-2;
    max-height: 320px;
    padding: 0;
    margin: tokens.$space-5 0 0;
    overflow-y: auto;
    list-style: none;
  }

  &__track {
    display: flex;
    align-items: center;
    gap: tokens.$space-3;
    width: 100%;
    padding: tokens.$space-3;
    border: 1px solid transparent;
    border-radius: tokens.$radius-sm;
    background: tokens.$color-library;
    color: tokens.$color-text;
    text-align: left;

    &:hover {
      background: tokens.$color-track-hover;
    }

    &--active {
      border-color: tokens.$color-accent;
      background: tokens.$color-track-active;
    }
  }

  &__symbol {
    color: tokens.$color-accent;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;

    strong {
      @include mixins.text-truncate;

      font-size: tokens.$font-size-md;
    }

    > span {
      color: tokens.$color-text-muted;
      font-size: tokens.$font-size-xs;
    }
  }
}
</style>
