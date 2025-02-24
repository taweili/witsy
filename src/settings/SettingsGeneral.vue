
<template>
  <div class="content">
    <div class="group prompt">
      <label>Prompt LLM Model</label>
      <EngineSelect class="engine" v-model="engine" @change="onChangeEngine" default-text="Last one used" />&nbsp;
      <ModelSelect class="model" v-model="model" @change="onChangeModel" :engine="engine" :default-text="!models.length ? 'Last one used' : ''" />
    </div>
    <div class="group language">
      <label>Answer in</label>
      <LangSelect v-model="language" @change="save" />
    </div>
    <div class="group reset-tips">
      <label>Reset tips</label>
      <button @click.prevent="onResetTips">Reset</button>
    </div>
    <div class="group run-at-login">
      <label>Run at login</label>
      <input type="checkbox" v-model="runAtLogin" @change="save" />
    </div>
    <div class="group hide-on-startup">
      <label>Hide main window on start</label>
      <input type="checkbox" v-model="hideOnStartup" @change="save" />
    </div>
    <div class="group keep-running">
      <label>Keep in Status Bar</label>
      <input type="checkbox" v-model="keepRunning" @change="save" />
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { store } from '../services/store'
import EngineSelect from '../components/EngineSelect.vue'
import ModelSelect from '../components/ModelSelect.vue'
import LangSelect from '../components/LangSelect.vue'

const engine = ref(null)
const model = ref(null)
const language = ref(null)
const runAtLogin = ref(false)
const hideOnStartup = ref(false)
const keepRunning = ref(false)

const models = computed(() => {
  if (!engine.value || engine.value == '') return []
  if (!store.config.engines[engine.value]) {
    engine.value = ''
    model.value = ''
    save()
    return []
  }
  return store.config.engines[engine.value].models.chat
})

const load = () => {
  engine.value = store.config.prompt.engine || ''
  model.value = store.config.prompt.model || ''
  language.value = store.config.general.language
  runAtLogin.value = window.api.runAtLogin.get()
  hideOnStartup.value = store.config.general.hideOnStartup
  keepRunning.value = store.config.general.keepRunning
}

const onResetTips = () => {
  store.config.general.tips = {}
  store.saveSettings()
}

const onChangeEngine = () => {
  if (engine.value == '') model.value = ''
  else model.value = store.config.engines[engine.value].models.chat?.[0]?.id
  save()
}

const onChangeModel = () => {
  save()
}

const save = () => {
  store.config.prompt.engine = engine.value
  store.config.prompt.model = model.value
  store.config.general.language = language.value
  window.api.runAtLogin.set(runAtLogin.value)
  store.config.general.hideOnStartup = hideOnStartup.value
  store.config.general.keepRunning = keepRunning.value
  store.saveSettings()
}

defineExpose({ load })

</script>

<style scoped>
@import '../../css/dialog.css';
@import '../../css/tabs.css';
@import '../../css/form.css';
</style>

<style scoped>
form .group label {
  min-width: 170px;
}
</style>