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

      <div class="login__map">
        <svg
          viewBox="0 0 260 96"
          width="260"
          height="96"
          aria-hidden="true"
        >
          <path
            class="login__line login__line--1"
            d="M8 28 H70 L104 62 H196"
          />
          <path
            class="login__line login__line--2"
            d="M8 76 H86 L120 42 H252"
          />
          <circle
            class="login__stop login__stop--1"
            cx="70"
            cy="28"
            r="6"
          />
          <circle
            class="login__stop login__stop--2"
            cx="120"
            cy="42"
            r="6"
          />
          <circle
            class="login__stop login__stop--1"
            cx="152"
            cy="62"
            r="6"
          />
          <circle
            class="login__interchange"
            cx="104"
            cy="62"
            r="9"
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
  background: var(--ground);
}

.login__panel {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  width: 100%;
  max-width: 24rem;
  padding: var(--s-6) var(--s-5);
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--r-panel);
}

.login__brand {
  margin-bottom: var(--s-4);
}

.login__map svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 16rem;
}

.login__line {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login__line--1 {
  stroke: var(--line-2);
}

.login__line--2 {
  stroke: var(--line-1);
}

.login__stop {
  fill: var(--surface);
  stroke-width: 3;
}

.login__stop--1 {
  stroke: var(--line-2);
}

.login__stop--2 {
  stroke: var(--line-1);
}

.login__interchange {
  fill: var(--surface);
  stroke: var(--ink);
  stroke-width: 3;
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
  color: var(--alert);
}

.login__failed {
  font-size: 0.875rem;
  color: var(--alert);
  padding: var(--s-2) var(--s-4);
  background: var(--alert-weak);
  border-radius: var(--r-pill);
}

.login__submit {
  width: 100%;
}
</style>
