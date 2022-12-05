<template>
  <div class="create-task">
    <p class="text-h3">Новое задание</p>

    <v-card class="mt-8" style="padding: 16px">
      <v-row>
        <v-col cols="8">
          <v-text-field
              style="width: 373px; margin-bottom: 20px;"
              v-model="form.taskName"
              clearable
              label="Название"
              variant="solo"
          />

          <v-text-field
              style="width: 373px; margin-bottom: 20px;"
              v-model="form.desc"
              clearable
              label="Описание"
              variant="solo"
          />

          <!--   QUESTIONS   -->
          <v-text-field
              v-for="(question, index) of questions"
              :key="index"
              v-model="question.text"
              clearable
              style="width: 373px; margin-bottom: 20px;"
              :label="`Вопрос ${index + 1}`"
              variant="solo"
          />

          <VBtn
              @click="onAddQuestion"
              color="success"
              class="mt-4"
          >
            добавить вопрос
          </VBtn>
        </v-col>

        <v-col cols="4">
          <v-select
              style="width: 373px;"
              v-model="form.gender"
              clearable
              label="Выберите пол"
              variant="solo"
              :items="['Мужской', 'Женский']"
          />
          <v-select
              style="width: 373px;"
              v-model="city.value"
              clearable
              label="Выберите город"
              variant="solo"
              :items="city.options"
              item-value="id"
              item-title="name"
          />
          <v-text-field
              style="width: 373px;"
              v-model="form.minYear"
              type="number"
              clearable
              label="Минимальный допустимый возраст"
              variant="solo"
          />
          <v-text-field
              style="width: 373px;"
              v-model="form.maxYear"
              type="number"
              clearable
              label="Максимальный допустимый возраст"
              variant="solo"
          />
          <v-text-field
              style="width: 373px;"
              v-model="form.personQty"
              type="number"
              clearable
              label="Количество человек"
              variant="solo"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-btn
        color="success"
        class="mt-8"
        @click="create"
    >
      Создать
    </v-btn>
  </div>
</template>

<script setup>
const questions = ref([
  { text: '' }
])
const city = reactive({
  value: null,
  options: []
})

const form = reactive({
  taskName: '',
  desc: '',
  gender: null,
  minYear: null,
  maxYear: null,
  personQty: null
})

onMounted(() => {
  fetchCities()
})

/* METHODS */
function onAddQuestion () {
  questions.value.push({ text: '' })
}

async function fetchCities () {
  const query = await gql`
    query {
      cities(is_delete: false) {
        data {
          id
          name
        }
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.cities?.data || []

  city.options = data.map(item => ({
    id: item.id,
    name: item.name
  }))
}

async function create () {
  const query = gql`
    mutation createTask (
      $name: String!
      $text: String!
      $city: String
      $sex: String
      $min_age: Int
      $max_age: Int
      $questions: [QuestionInput]
    ) {
      createTask(
        name: $name,
        text: $text,
        city: $city,
        sex: $sex,
        min_age: $min_age,
        max_age: $max_age,
        questions: $questions
      ) {
        id
      }
    }
  `

  try {
    await useAsyncQuery(query, {
      name: form.taskName,
      text: form.desc,
      city: city.options.find(item => item.id == city.value)?.name || null,
      sex: form.gender,
      min_age: Number(form.minYear) || null,
      max_age: Number(form.maxYear) || null,
      questions: questions.value.map((item, index) => {
        return { text: item.text, priority: index + 1 }
      })
    })

     window.location = '/tasks'
  } catch (e) {
    alert('произошла ошибка')
  }
}
</script>
