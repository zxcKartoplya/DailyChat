<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { Schema } from '~/utils/shemas/AuthSchema'
import { authSchema } from '~/utils/shemas/AuthSchema'

const toast = useToast()
const router = useRouter()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Введите email',
  required: true
}, {
  name: 'password',
  label: 'Пароль',
  type: 'password',
  placeholder: 'Введите пароль',
  required: true
}]

// TODO убрать такую типизацию
const onSubmit = (payload: FormSubmitEvent<Schema>) => {
  router.push('/')
  console.log(payload)
  toast.add({ title: 'Авторизация', description: 'Вход успешно выполнен!' })
}
</script>

<template>
  <div class="flex flex-col h-screen items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="authSchema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
