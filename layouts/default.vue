<template>
  <v-app class="default-layout">
    <v-navigation-drawer
        class="drawer-color"
        model-value>
      <v-list class="mt-9">
        <v-list-item
            class="white"
            v-for="(item, index) of [
                { link: '/users', text: 'Пользователи', icon: 'mdi-clock'},
                { link: '/requests', text: 'Заявки' },
                { link: '/tasks', text: 'Задания' },
                { link: '/templates', text: 'Шаблоны' },
                { link: '/settings', text: 'Настройки' }
            ]"
            :key="index"
            :to="item.link"
        >
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="background: #eee">
      <v-container
          class="py-8 px-6"
          fluid
      >
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
</script>

<style lang="scss">
.drawer-color {
  background: #363740;
}
.white {
  color: white;
}
</style>
