<template>
  <div class="login-page">
    <form @submit.prevent class="form">
      <v-text-field
        clearable
        label="Логин"
        variant="solo"
        v-model="form.email"
      />
      <v-text-field
        clearable
        label="Пароль"
        variant="solo"
        v-model="form.password"
      />
      <v-btn block size="large" @click="login">
        Войти
      </v-btn>
    </form>
  </div>
</template>

<script setup>
// definePageMeta({
//    middleware: ["auth"]
// })

const form = reactive({
  email: '',
  password: '',
})

async function login() {
  const query = gql`
    mutation logIn (
      $email: String
      $password: String
    ) {
        logIn (email: $email, password: $password)
    }
  `
  try {
    await useAsyncQuery(query, {
      email: form.email,
      password: form.password,
    })

    window.location = '/users'
  } catch (e) {
    alert('произошла ошибка')
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form {
  width: 500px;
}
</style>
