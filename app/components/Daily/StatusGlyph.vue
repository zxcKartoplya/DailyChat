<script lang="ts" setup>
import { ItemStatus } from '~/types/daily'

type Props = {
  status: ItemStatus
}

const { status } = defineProps<Props>()
</script>

<template>
  <svg
    class="glyph"
    viewBox="0 0 28 14"
    width="28"
    height="14"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <pattern
        :id="`glyph-hatch-${status}`"
        width="3"
        height="3"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="3"
          stroke="currentColor"
          stroke-width="1.2"
        />
      </pattern>
    </defs>

    <template v-if="status === ItemStatus.IN_PROGRESS">
      <line
        x1="1"
        y1="7"
        x2="26"
        y2="7"
        class="glyph__line"
      />
      <circle
        cx="21"
        cy="7"
        r="2.6"
        class="glyph__node"
      />
    </template>

    <template v-else-if="status === ItemStatus.DONE">
      <line
        x1="1"
        y1="7"
        x2="20"
        y2="7"
        class="glyph__line"
      />
      <line
        x1="20"
        y1="1"
        x2="20"
        y2="13"
        class="glyph__terminal"
      />
    </template>

    <template v-else-if="status === ItemStatus.BLOCKED">
      <line
        x1="1"
        y1="7"
        x2="13"
        y2="7"
        class="glyph__line"
      />
      <rect
        x="13"
        y="1"
        width="12"
        height="12"
        :fill="`url(#glyph-hatch-${status})`"
      />
    </template>

    <template v-else>
      <line
        x1="1"
        y1="7"
        x2="15"
        y2="7"
        class="glyph__line"
      />
      <circle
        cx="17"
        cy="7"
        r="2"
        class="glyph__node"
      />
    </template>
  </svg>
</template>

<style scoped>
.glyph {
  flex: none;
}

.glyph__line {
  stroke: currentColor;
  stroke-width: 1.6;
}

.glyph__terminal {
  stroke: currentColor;
  stroke-width: 2;
}

.glyph__node {
  fill: currentColor;
}
</style>
