<template>
   <div class="requests-page">
      <p class="text-h3">Заявки</p>

      <v-table class="mt-4">
         <thead>
            <tr>
               <th v-for="item of tableHeaders" :key="item.id" class="text-left">
                  <div>
                     {{ item.name }}
                     <v-icon v-if="item.id === 'status'" :icon="mdiFilter" />
                  </div>
                  <v-menu v-if="item.id === 'status'" activator="parent">
                     <v-list>
                        <v-list-item @click="() => filterByStatus(null)">
                           <v-list-item-title>Сбросить</v-list-item-title>
                        </v-list-item>
                        <v-list-item 
                           v-for="status in statuses" 
                           :key="status.value"
                           @click="() => filterByStatus(status.value)">
                           <v-list-item-title>{{ status.description }}</v-list-item-title>
                        </v-list-item>
                     </v-list>
                  </v-menu>

               </th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(row, index) in tableBody" :key="index">
               <td v-for="h of tableHeaders" :key="h.id">
                  <a class="user-page-colors" v-if="h.id === 'name'" :href="`requests/${row.id}?userID=${row.userID}`">
                     {{ row[h.id] || '' }}
                  </a>

                  <template v-else>
                     {{ row[h.id] || '' }}
                  </template>
               </td>
            </tr>
         </tbody>
      </v-table>
      <v-pagination v-if="Math.ceil(pagination.total / pagination.perPage) > 1" v-model="pagination.currentPage"
         :length="Math.ceil(pagination.total / pagination.perPage)" class="mt-4" @update:modelValue="fetchRequests">
      </v-pagination>
   </div>
</template>

<script setup>
import { mdiFilter } from '@mdi/js';
/* DATA */
const tableHeaders = [
   { id: 'name', name: 'Имя' },
   { id: 'taskName', name: 'Название задачи' },
   { id: 'city', name: 'Город' },
   { id: 'birthday', name: 'Дата рождения' },
   { id: 'status', name: 'Cтатус' },
   { id: 'gender', name: 'Пол' },
   { id: 'phone', name: 'Телефон' }
]
const tableBody = ref([])
const statuses = ref([])

const pagination = reactive({
   total: 0,
   perPage: 15,
   currentPage: 1
})
const currentStatus = ref(null)

onMounted(() => {
   fetchRequests()
   fetchStatuses()
})

/* METHODS */
function filterByStatus(status) {
   currentStatus.value = status
   fetchRequests()
}

async function fetchRequests() {
   const query = await gql`
    query {
      telegramUsersTasks(page: ${pagination.currentPage}, first: ${pagination.perPage} ${currentStatus.value !== null ? `, status: ${currentStatus.value}` : ''}) {
        data {
          id
          telegramUser {
            id,
            name,
            city,
            birth_date,
            phone,
            sex
          }
          task {
            name
          },
          status
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
   const data = res?.data?.value?.telegramUsersTasks?.data || []
   const pagInfo = res?.data?.value?.telegramUsersTasks?.paginatorInfo || {}
   pagination.total = pagInfo.total

   tableBody.value = data.map(item => ({
      id: item?.id || '',
      userID: item?.telegramUser?.id || '',
      name: item?.telegramUser?.name || '',
      taskName: item?.task?.name || '',
      city: item?.telegramUser?.city || '',
      birthday: item?.telegramUser?.birth_date || '',
      status: JSON.parse(item.status).description,
      gender: item?.telegramUser?.sex || '',
      phone: item?.telegramUser?.phone || ''
   }))
   console.log(data)
}
async function fetchStatuses() {
   const query = await gql`
      query {
         statuses
      }
   `
   const res = await useAsyncQuery(query)
   const data = res?.data?.value?.statuses || '[]'
   statuses.value = JSON.parse(data)
}
</script>

<style lang="scss" scoped>
.requests-page {
   .user-page-colors {
      color: #4C98CE
   }

}
</style>
