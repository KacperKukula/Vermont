<template>
  <section class="welcome-copy">
    <span class="eyebrow">TWOJE PLIKI. TWÓJ RYTM.</span>
    <h1>Dobry dźwięk.<br /><span>Własna przestrzeń.</span></h1>
    <p>Wgraj ulubione MP3 i słuchaj, kiedy chcesz. Twoja prywatna biblioteka, bez zbędnego szumu.</p>
    <div class="waveform" aria-hidden="true">
      <i v-for="n in 35" :key="n" :style="{ height: `${20 + ((n * 37) % 100)}px` }"></i>
    </div>
    <div class="features">
      <span>↗ Prywatna chmura</span><span>♫ Odtwarzanie MP3</span><span>◎ Twoja kolekcja</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as tokens;
@use '../../styles/mixins' as mixins;

.welcome-copy {
  h1 {
    margin-bottom: 25px;
    font-size: clamp(35px, 3.8vw, 58px);
    line-height: 1.16;
    letter-spacing: -2px;

    span {
      color: tokens.$color-accent;
    }
  }

  > p {
    max-width: 410px;
    font-size: 16px;
  }

  @include mixins.mobile {
    h1 {
      font-size: 42px;
    }

    > p {
      font-size: tokens.$font-size-md;
    }
  }
}

.waveform {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 160px;
  margin: 35px 0 22px;
  overflow: hidden;

  i {
    display: block;
    flex: 0 0 5px;
    border-radius: tokens.$radius-pill;
    background: linear-gradient(tokens.$color-accent, tokens.$color-waveform-end);
    opacity: 0.8;

    &:nth-child(3n) {
      opacity: 0.35;
    }
  }

  @include mixins.mobile {
    display: none;
  }
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  color: tokens.$color-text-muted;
  font-size: tokens.$font-size-sm;

  @include mixins.mobile {
    gap: 15px;
    margin-top: tokens.$space-6;
    font-size: tokens.$font-size-2xs;
  }
}
</style>
