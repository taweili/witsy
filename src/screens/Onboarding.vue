<template>

  <div class="overlay" />

  <div class="onboarding" v-bind="$attrs">

    <div class="close"><BIconXLg @click="$emit('close')" /></div>

    <main>
      <Welcome v-if="step === 1" />
      <Chat v-if="step === 2" />
      <Ollama v-if="step === 3" />
      <Studio v-if="step === 4" />
      <Voice v-if="step === 5" />
      <Permissions ref="permissions" v-if="step === 6 && isMacOS" />
      <Instructions ref="instructions" v-if="step === 7" />
      <Done v-if="step === 8" />
    </main>

    <footer>
      <form class="large">
        <button v-if="step !== 1" class="prev" @click.prevent="onPrev">{{ t('common.wizard.prev')}}</button>
        <button v-if="step !== 8" class="next default" @click.prevent="onNext">{{ t('common.wizard.next')}}</button>
        <button v-if="step === 8" class="last" @click.prevent="$emit('close')">{{ t('common.close')}}</button>
      </form>
    </footer>

  </div>

</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { t } from '../services/i18n'
import Welcome from '../onboarding/Welcome.vue'
import Chat from '../onboarding/Chat.vue'
import Ollama from '../onboarding/Ollama.vue'
import Instructions from '../onboarding/Instructions.vue'
import Permissions from '../onboarding/Permissions.vue'
import Studio from '../onboarding/Studio.vue'
import Voice from '../onboarding/Voice.vue'
import Done from '../onboarding/Done.vue'

defineEmits(['close']);

const step = ref(1);
const instructions = ref<typeof Instructions>(null);
const permissions = ref<typeof Permissions>(null);

// Check if we're on macOS
const isMacOS = computed(() => window.api?.platform === 'darwin');

const onPrev = () => {
  if (step.value === 1) return;
  
  // If going back from Instructions (step 7) to Permissions (step 6) on non-macOS, skip to step 5
  if (step.value === 7 && !isMacOS.value) {
    step.value = 5;
  } else {
    step.value--;
  }
}

const onNext = async () => {

  // Check canLeave for Permissions screen (step 6) on macOS
  if (permissions.value && step.value === 6 && isMacOS.value) {
    if (!await permissions.value.canLeave()) {
      return;
    }
  }

  // Check canLeave for Instructions screen (step 7)
  if (instructions.value && step.value === 7) {
    if (!await instructions.value.canLeave()) {
      return;
    }
  }

  // If advancing from Voice (step 5) on non-macOS, skip Permissions and go to Instructions (step 7)
  if (step.value === 5 && !isMacOS.value) {
    step.value = 7;
  } else {
    step.value++;
  }
}

</script>

<style scoped>
@import '../../css/form.css';
</style>

<style scoped>

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--text-color);
  opacity: 0.25;
  z-index: 19;
}

.onboarding {

  --onboarding-bg-color: var(--background-color);/*rgb(255, 254, 255);*/
  
  position: absolute;
  width: 850px;
  top: 10%;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1rem;
  z-index: 20;
  background-color: var(--onboarding-bg-color);
  border-color: 1px solid var(--dialog-border-color);
  padding: 4rem;
  padding-top: 2rem;
  color: var(--text-color);
  
  main {
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 3rem;
    height: calc(100% - 3rem);

    &:deep() section {

      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;

      header {
        position: sticky;
        top: 0;
        background-color: var(--onboarding-bg-color);
        z-index: 10;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;

        h1 {
          margin-bottom: 0.5rem;
        }

        h3 {
          padding: 0 4rem;
          text-align: center;
          color: var(--dimmed-text-color);
          font-weight: 400;
        }
      }

      & > *:not(header) {
        flex: 1;
        width: 100%;
        overflow-y: auto;
        padding-top: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

    }

  }

  .close {
    position: absolute;
    top: 1.25rem;
    right: 1.5rem;
    cursor: pointer;
  }

  footer {
    width: 100%;
    form {
      display: flex;
      button {
        outline: none;
      }
      .next, .last {
        margin-left: auto;
      }
    }
  }
}

</style>
