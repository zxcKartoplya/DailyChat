<script lang="ts" setup>
const router = useRouter()
const toast = useToast()
const { logout } = useAuth()

const nav = [
  { to: '/', label: 'Дейлик', icon: 'i-lucide-pen-line' },
  { to: '/history', label: 'История', icon: 'i-lucide-layers' },
  { to: '/analytics', label: 'Аналитика', icon: 'i-lucide-activity' },
  { to: '/profile', label: 'Профиль', icon: 'i-lucide-user' }
]

const exitAccount = () => {
  logout()
  toast.add({ title: 'Вы вышли из аккаунта' })
  router.push('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="shell__nav">
      <div class="shell__brand">
        <AppLogo />
      </div>

      <nav class="shell__links">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="shell__link"
          active-class="shell__link--active"
        >
          <UIcon
            :name="item.icon"
            class="shell__link-icon"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="shell__foot">
        <AppThemeToggle />
        <button
          type="button"
          class="shell__exit"
          @click="exitAccount"
        >
          <UIcon name="i-lucide-log-out" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>

    <main class="shell__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: var(--nav-w) 1fr;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--paper);
}

.shell__nav {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  padding: var(--s-4) var(--s-3);
  border-right: 1px solid var(--grid);
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
}

.shell__brand {
  padding: 0 var(--s-2);
}

.shell__links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.shell__link {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  height: var(--ctrl-h);
  padding: 0 var(--s-2);
  color: var(--ink-2);
  border-radius: var(--r-1);
  font-size: 0.9375rem;
  transition: color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.shell__link:hover {
  color: var(--ink);
  background: var(--surface-hover);
}

.shell__link--active {
  color: var(--accent-text);
  background: var(--accent-weak);
}

.shell__link-icon {
  color: var(--ink-3);
}

.shell__link--active .shell__link-icon {
  color: var(--accent-text);
}

.shell__foot {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding-top: var(--s-3);
  border-top: 1px solid var(--grid);
}

.shell__exit {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  height: var(--ctrl-h-sm);
  padding: 0 var(--s-2);
  background: none;
  border: 0;
  border-radius: var(--r-1);
  color: var(--ink-3);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.shell__exit:hover {
  color: var(--ink);
  background: var(--surface-hover);
}

.shell__main {
  padding: var(--s-5) var(--s-6) var(--s-6);
  min-width: 0;
}

@media (max-width: 60rem) {
  .shell {
    grid-template-columns: 1fr;
  }

  .shell__nav {
    position: sticky;
    top: 0;
    z-index: 20;
    height: auto;
    flex-direction: row;
    align-items: center;
    gap: var(--s-4);
    padding: var(--s-2) var(--s-4);
    background: var(--paper);
    border-right: 0;
    border-bottom: 1px solid var(--grid-strong);
  }

  .shell__links {
    flex-direction: row;
    gap: var(--s-1);
    overflow-x: auto;
    flex: 1;
  }

  .shell__link span {
    display: none;
  }

  .shell__link {
    width: var(--ctrl-h);
    justify-content: center;
  }

  .shell__link-icon {
    font-size: 1.125rem;
  }

  .shell__foot {
    flex-direction: row;
    align-items: center;
    gap: var(--s-2);
    padding-top: 0;
    border-top: 0;
  }

  .shell__exit span {
    display: none;
  }

  .shell__main {
    padding: var(--s-4) var(--s-4) var(--s-6);
  }
}
</style>
