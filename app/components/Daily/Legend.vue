<template>
  <dl class="legend">
    <div class="legend__item">
      <dt class="legend__mark legend__mark--stop" />
      <dd>станция</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--delayed" />
      <dd>задержка</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--terminus" />
      <dd>конечная</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--cut" />
      <dd>съезд</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--today" />
      <dd>сегодня</dd>
    </div>
  </dl>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-5);
  color: var(--ink-3);
  font-size: 0.75rem;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.legend__mark {
  flex: none;
  width: 12px;
  height: 12px;
  background: var(--surface);
  border: 3px solid var(--ink-3);
  border-radius: 50%;
}

.legend__mark--delayed {
  border-color: var(--alert);
  box-shadow: inset 0 0 0 2px var(--surface), inset 0 0 0 5px var(--alert);
}

.legend__mark--terminus {
  width: 4px;
  height: 14px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--ink-3);
}

.legend__mark--cut {
  border: 0;
  background: var(--ink-3);
  opacity: 0.5;
}

.legend__mark--today {
  border-width: 2px;
  border-style: dashed;
}
</style>
