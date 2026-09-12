<template>
  <dl class="legend">
    <div class="legend__item">
      <dt class="legend__mark legend__mark--stop" />
      <dd>идёт</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--delayed" />
      <dd>встал</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--terminus" />
      <dd>готово</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--cut" />
      <dd>бросил</dd>
    </div>
    <div class="legend__item">
      <dt class="legend__mark legend__mark--today" />
      <dd>сегодня, не отмечено</dd>
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
  position: relative;
  width: 9px;
  height: 9px;
  border: 0;
  background: var(--ink-3);
}

.legend__mark--cut::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 5px;
  background: var(--ink-3);
  border-radius: var(--r-pill);
  transform-origin: left center;
  transform: translate(-2px, -2px) rotate(42deg);
}

.legend__mark--today {
  border-width: 2px;
  border-style: dashed;
}
</style>
