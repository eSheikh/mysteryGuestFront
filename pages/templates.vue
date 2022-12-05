<template>
  <div class="templates-page">
    <div
      style="display:flex; align-items:center; justify-content:space-between; flex-wrap: wrap"
    >
      <p class="text-h3">Шаблоны</p>

      <v-btn color="info" @click="isCreateDialogOpened = true">
        Создать
      </v-btn>
    </div>

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
          v-for="(row, index) in computedTableBody"
          :key="index"
      >
        <td
            v-for="h of tableHeaders"
            :key="h.id"
        >
          <template v-if="h.id !== 'actionDelete'">
            {{ row[h.id] || '' }}
          </template>

          <VBtn
              color="error"
              v-else
              @click="onDelete(row)"
          >
            {{ row.actionDelete }}
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
        @update:modelValue="fetchTemplates"
    ></v-pagination>

    <v-dialog v-model="isCreateDialogOpened">
      <v-card style="padding: 40px; width: 600px; margin: 0 auto; overflow: hidden">
        <p style="margin-left: 35px" class="text-h4">Заполните данные</p>

        <v-text-field
            style="width: 450px; margin: 0 auto;"
            v-model="createData.name"
            clearable
            label="Название"
            variant="solo"
            class="mt-5"
        />

        <v-text-field
            style="width: 450px; margin: 0 auto;"
            v-model="createData.text"
            clearable
            label="Текст"
            variant="solo"
            class="mt-4"
        />

        <v-btn
            style="width: 226px; margin-left: 35px;"
            color="success"
            class="mt-4"
            @click="onCreate"
        >
          Создать
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
/* DATA */
const tableHeaders = [
  { id: 'name', name: 'Название' },
  { id: 'text', name: 'Текст' },
  { id: 'actionDelete', name: '' }
]
const tableBody = ref([])
const isCreateDialogOpened = ref(false)

const pagination = reactive({
  total: 0,
  perPage: 15,
  currentPage: 1
})

const createData = reactive({
  name: '',
  text: ''
})

/* COMPUTED */
const computedTableBody = computed(() => {
  return tableBody.value.map(item => ({
    ...item,
    'actionDelete': 'Удалить'
  }))
})

onMounted(async () => {
  await fetchTemplates()
})

/* METHODS */
async function fetchTemplates () {
  const query = await gql`
    query {
      templates (is_delete: false, page: ${pagination.currentPage}, first: ${pagination.perPage}) {
        data {
          id
          name
          text
          is_delete
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
  const data = res?.data?.value?.templates?.data || []
  const pagInfo = res?.data?.value?.templates?.paginatorInfo || {}
  pagination.total = pagInfo.total

  tableBody.value = data
}

async function onDelete (tableRow) {
  const query = gql`
    mutation {
      deleteTemplate(id: ${tableRow.id}) {
        id
      }
    }
  `

  try {
    await useAsyncQuery(query)

    const curIndex = tableBody.value.findIndex(i => i.id === tableRow.id)
    tableBody.value.splice(curIndex, 1)
  } catch (e) {
    console.log(e)
    alert('Произошла ошибка!')
  }
}

async function onCreate () {
  const query = gql`
    mutation {
      createTemplate(name:"${createData.name}", text:"${createData.text}") {
        id
      }
    }
  `

  let needReload = true
  try {
    await useAsyncQuery(query)

    isCreateDialogOpened.value = false
    createData.name = ''
    createData.text = ''
  } catch (e) {
    console.log(e)
    alert('Произошла ошибка!')
    needReload = false
  }

  if (needReload) {
    fetchTemplates()
  }
}
</script>

<style lang="scss" scoped>

</style>
