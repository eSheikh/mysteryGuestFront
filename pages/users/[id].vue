<template>
  <div class="page-user">
    <p class="text-h3">{{ userData.name }}</p>

    <v-row class="mt-8">
      <v-col :cols="6">
        <v-card style="padding: 24px;">
          <p
              v-for="(item, index) of computedUserInfo"
              :key="index"
              class="mt-2"
          >
            <span>{{ item.key }}: {{ item.value }}</span>
          </p>
        </v-card>
      </v-col>
      <v-col cols="6">
        <h3 class="mb-4"> Список выполняемых заданий: </h3>
        <v-card
            style="padding: 16px; margin-bottom: 20px"
            elevation="1"
        >
          <v-col class="d-flex" cols="6" style="flex-wrap: wrap;max-width: 100%;">
            <v-btn style="margin: 10px;" v-for="(item, index) of currentTasks" :key="index"  color="blue"><a :href="`/requests/${item.requestId}?userID=${userData.id}`" style="text-decoration: none; color: inherit">{{ item.name }} ({{ item.status.title }})</a></v-btn>
          </v-col>
        </v-card>
        <h3 class="mb-4"> Список доступных к назначению заданий: </h3>
        <v-card
            style="padding: 16px"
            elevation="1"
        >
          <v-col class="d-flex" cols="6" style="flex-wrap: wrap;max-width: 100%;">
            <v-btn @click="taskDialog(item.id, item.name)" style="display: flex; margin: 10px;" v-for="(item, index) of tasks" :key="index"  color="blue"> {{ item.name }} </v-btn>
          </v-col>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isSetTaskDialogOpened">
      <v-card style="padding: 20px; width: 500px; margin: 0 auto;">
        <p style="margin-bottom: 20px; text-align: center;">Вы хотите назначить задание "{{newTask.name}}"?</p>
          <v-btn @click="onSetTask(newTask.id)" class="m-4" color="success" style="width: 233px; margin: 0 auto;">Да</v-btn>
      </v-card>
    </v-dialog>

  </div>

</template>

<script setup>
/* DATA */
const userData = reactive({
  id: null,
  name: null,
  city: null,
  date: null,
  gender: null,
  phone: null,
  status: null
})

const currentTasks = ref([])

const tasks = ref([])

const isSetTaskDialogOpened = ref(false)

const newTask = reactive({
  'id': '',
  'name': ''
})
/* COMPUTED */
const computedUserInfo = computed(() => {
  return [
    { key: 'Имя', value: userData.name },
    { key: 'Город', value: userData.city },
    { key: 'Дата рождения', value: userData.date },
    { key: 'Пол', value: userData.gender },
    { key: 'Телефон', value: userData.phone }
  ]
})

onMounted(async () => {
  await fetchUserData()
  await fetchCurrentTasks()
  await fetchTasks()
})

/* METHODS */
async function fetchUserData () {
  const route = useRoute()
  // const requestID = route.params.id

  const query = await gql`
    query {
      telegramUser(id: ${route.params.id}) {
          id
          name
          sex
          city
          birth_date
          phone
      }
    }
  `
  const res = await useAsyncQuery(query)
  const data = res.data.value.telegramUser

  userData.name = data.name
  userData.city = data.city
  userData.date = data.birth_date
  userData.gender = data.sex
  userData.phone = data.phone
  userData.id = data.id
}

async function fetchCurrentTasks () {
  const route = useRoute()
  const query = await gql`
    query {
      telegramUsersTasks (telegram_user_id: ${route.params.id}, status: [0,1,2]) {
        data {
            id
            status
            task {
                name
          }
        }
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.telegramUsersTasks?.data || []

  currentTasks.value = data.map(item => ({
    name: item.task.name,
    requestId: item.id,
    status: {
      id: JSON.parse(item.status || null).value,
      value: JSON.parse(item.status || null).name,
      title: JSON.parse(item.status || null).description
    }
  }))
}

async function fetchTasks () {
  const query = await gql`
    query {
      tasks (is_delete: false) {
        data {
          name,
          id
        }
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.tasks?.data || []

  tasks.value = data.map(item => ({
    name: item.name,
    id: item.id
  }))
}

function taskDialog(id, name) {
  isSetTaskDialogOpened.value = true
  newTask.id = id
  newTask.name = name
}

async function onSetTask (taskId) {
  const query = gql`
    mutation {
        setTask(task_id: ${taskId}, telegram_user_id: ${userData.id}) {
        id
        }
    }
  `

  let needReload = true
  try {
    await useAsyncQuery(query)

    isSetTaskDialogOpened.value = false
    newTask.id = ''
    newTask.name = ''
  } catch (e) {
    console.log(e)
    alert('Произошла ошибка!')
    needReload = false
  }

  if (needReload) {
    fetchCurrentTasks()
  }
}

</script>

<style scoped>

</style>
