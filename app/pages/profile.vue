<script lang="ts" setup>
definePageMeta({ layout: 'auth' })
useHead({ title: 'Профиль' })

const router = useRouter()
const toast = useToast()
const { logout } = useAuth()

const exitAccount = () => {
  logout()
  toast.add({ title: 'Вы вышли из аккаунта' })
  router.push('/login')
}
</script>

<template>
  <div class="profile">
    <header class="profile__head">
      <h1 class="profile__title">
        Профиль
      </h1>
      <p class="profile__lead">
        Оформление и выход из аккаунта.
      </p>
    </header>

    <section class="profile__section">
      <h2 class="profile__section-title">
        Тема
      </h2>
      <div class="profile__row">
        <p class="profile__row-text">
          Светлая для дневного офиса, тёмная для вечера. «Как в системе» следует за настройкой устройства.
        </p>
        <AppThemeToggle />
      </div>
    </section>

    <section class="profile__section">
      <h2 class="profile__section-title">
        Видимость записей
      </h2>
      <p class="profile__row-text">
        Дейлики и причины блокеров читает руководитель департамента. Это правило продукта, отключить его нельзя.
      </p>
    </section>

    <section class="profile__section">
      <h2 class="profile__section-title">
        Аккаунт
      </h2>
      <div class="profile__row">
        <p class="profile__row-text">
          Выход очистит токен на этом устройстве. Черновик сегодняшнего дня останется здесь же.
        </p>
        <button
          type="button"
          class="btn btn--secondary"
          @click="exitAccount"
        >
          Выйти
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  max-width: 46rem;
  padding-bottom: var(--s-7);
}

.profile__head {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--hairline-strong);
}

.profile__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.012em;
}

.profile__lead {
  color: var(--ink-2);
  font-size: 0.9375rem;
}

.profile__section {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--hairline);
}

.profile__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.profile__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.profile__row-text {
  color: var(--ink-2);
  font-size: 0.875rem;
  max-width: 52ch;
}
</style>
