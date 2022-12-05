<template>
  <div class="users-page">
    <p class="text-h3">Пользователи</p>
    <v-table class="mt-4">
      <thead>
        <tr>
          <th
              v-for="item of tableHeaders"
              :key="item.id"
              class="text-left"
          >
            {{ item.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
            v-for="(row, index) in tableBody"
            :key="index"
        >
          <td
              v-for="h of tableHeaders"
              :key="h.id"
          >
            <a class="user-page-colors" v-if="h.id === 'name'" :href="`users/${row.id}`">
              {{ row[h.id] || '' }}
            </a>
            <template v-else>
              {{ row[h.id] || '' }}
            </template>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-pagination
        v-if="Math.ceil(pagination.total / pagination.perPage) > 1"
        v-model="pagination.currentPage"
        :length="Math.ceil(pagination.total / pagination.perPage)"
        class="mt-4"
        @update:modelValue="fetchUsers"
    ></v-pagination>
  </div>
</template>

<script setup>
const tableHeaders = [
  { id: 'name', name: 'Имя' },
  { id: 'city', name: 'Город' },
  { id: 'birth_date', name: 'Возраст' },
  { id: 'sex', name: 'Пол' },
  { id: 'phone', name: 'Телефон' }
]
const tableBody = ref([])

const pagination = reactive({
  total: 0,
  perPage: 15,
  currentPage: 1
})

onMounted(() => {
  fetchUsers()
})

/* METHODS */
async function fetchUsers () {
  const query = await gql`
    query {
      telegramUsers (page: ${pagination.currentPage}, first: ${pagination.perPage}) {
        data {
          city
          name
          id
          birth_date
          sex
          phone
        }
        paginatorInfo {
          perPage
          total
          count
          currentPage
        }
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.telegramUsers?.data || []
  const pagInfo = res?.data?.value?.telegramUsers?.paginatorInfo || {}
  pagination.total = pagInfo.total

  tableBody.value = data
}
</script>

<style lang="scss" scoped>
.users-page {
  .user-page-colors {
    color: #4C98CE
  }
}
</style>
