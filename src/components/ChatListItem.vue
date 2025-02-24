<template>
  <div class="chat" :class="[{ selected: chat.uuid == active?.uuid }, store.config.appearance.chatList.layout]">
    <EngineLogo :engine="engine(chat)" :background="true" />
    <div class="info">
      <div class="title">{{ chat.title }}</div>
      <div class="subtitle">{{ chat.subtitle() }}</div>
    </div>
    <div v-if="selectMode" class="select">
      <BIconCheckCircleFill v-if="selection.includes(chat.uuid)" class="selected"/>
      <BIconCircle v-else />
    </div>
  </div>
</template>

<script setup lang="ts">

import { store } from '../services/store'
import EngineLogo from './EngineLogo.vue'
import Chat from '../models/chat'

defineProps({
  chat: {
    type: Chat,
    required: true,
  },
  active: {
    type: Chat,
    default: null,
  },
  selectMode: {
    type: Boolean,
    default: false,
  },
  selection: {
    type: Array<String>,
    required: true,
  },
})

const engine = (chat: Chat) => chat.engine || store.config.llm.engine

const emit = defineEmits(['select', 'menu']);

</script>

<style scoped>

.chat {
  margin: 2px 8px;
  margin-right: 16px;
  padding: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
}

.chat.selected {
  background-color: var(--sidebar-selected-color);
}

.chat .info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat .info * {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat .logo {
  width: var(--sidebar-logo-size);
  height: var(--sidebar-logo-size);
  margin-right: 8px;
}

.chat .title {
  font-weight: bold;
  font-size: 10.5pt;
}

.chat .subtitle {
  font-size: 9pt;
}

.chat .select {
  margin-left: 16px;
  text-align: right;
  flex: 1;
}

.chat.compact {
  margin: 0px 8px;
  padding: 4px 12px;
}

.chat.compact .logo {
  width: calc(var(--sidebar-logo-size) / 2);
  height: calc(var(--sidebar-logo-size) / 2);
}

.chat.compact .title {
  font-weight: normal;
  font-size: 10.5pt;
}

.chat.compact .subtitle {
  display: none;
}


</style>
