<template>
  <div class="page-user">
    <p class="text-h3">{{ userData.name }}</p>

    <v-row class="mt-8">
      <v-col :cols="6">
        <v-card style="padding: 24px;">
          <div
              v-if="userData?.status?.title"
              style="padding: 4px 12px; background: #fdecbb; display: inline-block; border-radius: 4px"
          >
            {{ userData?.status?.title }}
          </div>
          <p
            v-for="(item, index) of computedUserInfo"
            :key="index"
            class="mt-2"
          >
            <span>{{ item.key }}: {{ item.value }}</span>
          </p>
        </v-card>
      </v-col>
      <v-col :cols="6">
        <v-card style="padding: 24px;">
          <v-table class="mt-4">
            <thead>
            <tr>
              <th
                  v-for="item of tableHeader"
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
                  v-for="h of tableHeader"
                  :key="h.id"
              >
                {{ row[h.id] || '' }}
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card>

        <div v-if="userData?.status?.value === 'INSPECTION'" class="mt-8">
          <v-btn
              style="background: forestgreen; color: #fff"
              @click="onApprove"
          >
            Принять
          </v-btn>
          <v-btn
              style="background: #BE0303; color: #fff; margin-left: 20px;"
              @click="onReject"
          >
            Отклонить
          </v-btn>
        </div>

        <div class="mt-12">
          <v-text-field
              v-model="message"
              clearable
              label="Введите сообщение..."
              variant="solo"
          />

          <div>
            <v-chip
                v-for="(chip, index) of chips"
                :key="index"
                class="ma-2"
                color="blue"
                text-color="white"
                @click="message = chip.text"
            >
              {{ chip.name }}
            </v-chip>
          </div>

          <div class="mt-4">
            <v-btn
                color="success"
                @click="onSendMessage"
            >
              Отправить
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
/* DATA */
const tableHeader = [
  { id: 'question', name: 'Вопрос(Бот)' },
  { id: 'answer', name: 'Ответ(пользователь)' }
]
const tableBody = ref([])

const userData = reactive({
  id: null,
  name: null,
  city: null,
  date: null,
  gender: null,
  phone: null,
  status: null,
  chatID: null
})

const chips = ref([])

const message = ref('')

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
  await fetchQuestions()
  await fetchChips()
})

/* METHODS */
async function fetchUserData () {
  const route = useRoute()
  // const requestID = route.params.id

  const query = await gql`
    query {
      telegramUserTask(id: ${route.params.id}) {
        status
        telegramUser {
          id
          name
          sex
          city
          birth_date
          phone
          chat_id
        }
      }
    }
  `
  const res = await useAsyncQuery(query)
  const data = res.data.value.telegramUserTask

  const status = JSON.parse(data.status || null)

  userData.status = {
    id: status.value,
    value: status.name,
    title: status.description
  }

  userData.name = data.telegramUser.name
  userData.city = data.telegramUser.city
  userData.date = data.telegramUser.birth_date
  userData.gender = data.telegramUser.sex
  userData.phone = data.telegramUser.phone
  userData.chatID = data.telegramUser.chat_id
}

async function fetchQuestions () {
  const route = useRoute()
  const requestID = route.params.id

  const query = await gql`
    query {
      answers(telegram_user_id: ${route.query.userID}, telegram_users_tasks_id: ${requestID}) {
        answer,
        question
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.answers || []

  tableBody.value = data.map(item => ({
    question: item.question,
    answer: item.answer
  }))
}

async function fetchChips () {
  const query = await gql`
    query {
      templates (is_delete: false) {
        data {
          name,
          text,
          id
        }
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.templates?.data || []

  chips.value = data.map(item => ({
    name: item.name,
    text: item.text,
  }))
}

async function onApprove () {
  const route = useRoute()

  const query = await gql`
    mutation {
      updateTaskStatus(id: ${route.params.id}, status: 3) {
        id
      }
    }
  `

  let needReload = true
  try {
    await useAsyncQuery(query)
  } catch (e) {
    alert('Произошла ошибка!')
    needReload = false
  }


  if (needReload) {
    await fetchUserData()
    await fetchQuestions()
  }
}

async function onReject () {
  const route = useRoute()

  const query = await gql`
    mutation {
      updateTaskStatus(id: ${route.params.id}, status: 4) {
        id
      }
    }
  `

  let needReload = true
  try {
    await useAsyncQuery(query)
  } catch (e) {
    alert('Произошла ошибка!')
    needReload = false
  }


  if (needReload) {
    await fetchUserData()
    await fetchQuestions()
  }
}

async function onSendMessage () {
  const query = await gql`
    mutation sendMessage (
      $text: String!
      $chatID: ID!
    ) {
      sendMessage(text: $text, chat_id: $chatID) {
        id
      }
    }
  `

  const variables = {
    text: message.value,
    chatID: userData.chatID
  }

  try {
    await useAsyncQuery(query, variables)

    message.value = ''

    setTimeout(() => {
      alert('Сообщение отправлено!')
    })
  } catch (e) {
    alert('Произошла ошибка!')
  }
}
</script>

<style scoped>

</style>
