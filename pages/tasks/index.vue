<template>
  <div class="tasks-page">
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap: wrap">
      <p class="text-h3">Задания</p>

      <VBtn color="info" to="/create-task">создать</VBtn>
    </div>

    <v-table class="mt-4">
      <thead>
        <tr>
          <th
              v-for="item of tableHeader"
              :key="item.id"
              class="text-left"
          >
            {{ item.text }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
            v-for="(row, index) in computedTableBody"
            :key="index"
        >
          <td
              v-for="h of tableHeader"
              :key="h.id"
          >
            <a class="user-page-colors" v-if="h.id === 'name'" :href="`tasks/${row.id}`">
              {{ row[h.id] || '' }}
            </a>

            <template v-else-if="h.id === 'qty'">
              {{ row[h.id] || 0 }}
            </template>

            <VBtn
                color="error"
                v-else
                @click="onDelete(row)"
            >
              {{ row[h.id] }}
            </VBtn>

          </td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination
        v-if="Math.ceil(pagination.total / pagination.perPage) > 1"
        v-model="pagination.currentPage"
        :length="Math.ceil(pagination.total / pagination.perPage)"
        class="mt-4"
        @update:modelValue="fetchTasks"
    ></v-pagination>
  </div>
</template>

<script setup>
import { ref, computed } from '#imports'

/* DATA */
const tableHeader = [
  { id: 'name', text: 'Название'},
  { id: 'qty', text: 'Кол-во вопросов'},
  { id: 'action-delete', text: ''}
]
const tableBody = ref([])

const pagination = reactive({
  total: 0,
  perPage: 15,
  currentPage: 1
})

/* COMPUTED */
const computedTableBody = computed(() => {
  return tableBody.value.map(item => ({
    ...item,
    'action-delete': 'Удалить'
  }))
})

onMounted(async () => {
  try {
    await fetchTasks()
  } catch (e) {
    console.log(e)
  }
})

/* METHODS */
async function fetchTasks () {
  const query = await gql`
    {
      tasks (is_delete: false, page: ${pagination.currentPage}, first: ${pagination.perPage}) {
        data {
          id,
          name,
          questionsCount
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
  const data = res?.data?.value?.tasks?.data || []
  const pagInfo = res?.data?.value?.tasks?.paginatorInfo || {}
  pagination.total = pagInfo.total

  tableBody.value = data.map(item => ({
    id: item.id,
    qty: item.questionsCount,
    name: item.name
  }))
}

async function onDelete (row) {
  const query = await gql`
    mutation {
      deleteTask(id: ${row.id}) {
        id
      }
    }
  `
  let needReload = true
  try {
    await useAsyncQuery(query)
  } catch (e) {
    console.log(e)
    alert('Произошла ошибка!')
    needReload = false
  }

  if (needReload) {
    fetchTasks()
  }
}
</script>

<style lang="scss" scoped>
.tasks-page {
  .user-page-colors {
    color: #4C98CE
  }
}
</style>
