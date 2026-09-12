<script setup lang="ts">
import { useLoginStore } from '#imports'
import { authSchema } from '~/utils/shemas/AuthSchema'

const toast = useToast()
const router = useRouter()
const loginStore = useLoginStore()

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string, password?: string }>({})
const failed = ref(false)
const pending = ref(false)

useHead({ title: 'Вход' })

const onSubmit = async () => {
  const parsed = authSchema.safeParse({ email: email.value, password: password.value })

  errors.value = {}
  failed.value = false

  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0]

      if (field === 'email' || field === 'password') {
        errors.value[field] = issue.message
      }
    })

    return
  }

  pending.value = true

  try {
    await loginStore.loginUser(parsed.data)
    toast.add({ title: 'Вход выполнен' })
    router.push('/')
  } catch {
    failed.value = true
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login__panel">
      <AppLogo class="login__brand" />

      <div class="login__thread">
        <svg
          viewBox="0 0 240 24"
          width="240"
          height="24"
          aria-hidden="true"
        >
          <g class="login__grid">
            <line
              v-for="n in 7"
              :key="n"
              :x1="(n - 1) * 36"
              y1="0"
              :x2="(n - 1) * 36"
              y2="24"
            />
          </g>
          <line
            class="login__line"
            x1="0"
            y1="12"
            x2="200"
            y2="12"
          />
          <circle
            class="login__node"
            cx="54"
            cy="12"
            r="3.2"
          />
          <circle
            class="login__node"
            cx="126"
            cy="12"
            r="3.2"
          />
          <circle
            class="login__node login__node--open"
            cx="200"
            cy="12"
            r="3.2"
          />
        </svg>
      </div>

      <h1 class="login__title">
        Продолжим линию
      </h1>
      <p class="login__lead">
        Войди, чтобы записать сегодняшний день.
      </p>

      <form
        class="login__form"
        novalidate
        @submit.prevent="onSubmit"
      >
        <label class="login__field">
          <span class="login__label">Email</span>
          <input
            v-model="email"
            class="field"
            type="email"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            placeholder="почта, на которую заведён аккаунт"
          >
          <span
            v-if="errors.email"
            class="login__error"
          >{{ errors.email }}</span>
        </label>

        <label class="login__field">
          <span class="login__label">Пароль</span>
          <input
            v-model="password"
            class="field"
            type="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            placeholder="не меньше восьми символов"
          >
          <span
            v-if="errors.password"
            class="login__error"
          >{{ errors.password }}</span>
        </label>

        <p
          v-if="failed"
          class="login__failed"
          role="alert"
        >
          Не подошли почта или пароль. Проверь раскладку и попробуй ещё раз.
        </p>

        <button
          type="submit"
          class="btn btn--primary login__submit"
          :disabled="pending"
        >
          {{ pending ? 'Входим…' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--s-5) var(--s-4);
  background: var(--paper);
}

.login__panel {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  width: 100%;
  max-width: 23rem;
}

.login__brand {
  margin-bottom: var(--s-4);
}

.login__thread svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 15rem;
}

.login__grid line {
  stroke: var(--grid);
  stroke-width: 1;
}

.login__line {
  stroke: var(--ink-2);
  stroke-width: 1.6;
}

.login__node {
  fill: var(--ink-2);
}

.login__node--open {
  fill: var(--surface);
  stroke: var(--accent);
  stroke-width: 1.6;
}

.login__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.012em;
  color: var(--ink);
}

.login__lead {
  color: var(--ink-2);
  font-size: 0.9375rem;
  margin-bottom: var(--s-3);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.login__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-2);
}

.login__error {
  font-size: 0.75rem;
  color: var(--signal);
}

.login__failed {
  font-size: 0.875rem;
  color: var(--signal);
  padding: var(--s-2) var(--s-3);
  background: var(--signal-weak);
  border-radius: var(--r-1);
}

.login__submit {
  align-self: flex-start;
  min-width: 8rem;
}
</style>
