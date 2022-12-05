<template>
   <div class="create-task">
      <p class="text-h3">{{ form.taskName }}</p>

      <v-card class="mt-8" style="padding: 16px">
         <v-row>
            <v-col cols="8">
               <v-text-field style="width: 322px;" v-model="form.taskName" clearable label="Название" variant="solo" />

               <v-text-field style="width: 322px;" v-model="form.desc" clearable label="Описание" variant="solo" />

               <!--   QUESTIONS   -->
               <div class="question" v-for="(question, index) of questions" :key="index">
                  <v-text-field style="width: 322px; margin: 0;" v-model="question.text" clearable
                     :label="`Вопрос ${index + 1}`" variant="solo" />
                  <div class="question-controls text-grey-lighten-1">
                     <v-icon @click="() => changeQuestionOrder('up', index)" v-if="index !== 0"
                        :icon="mdiArrowUpCircle" />
                     <v-icon @click="() => changeQuestionOrder('down', index)" v-if="index !== questions.length - 1"
                        :icon="mdiArrowDownCircle" />
                  </div>
               </div>
               <VBtn color="success" @click="onAddQuestion">
                  добавить вопрос
               </VBtn>
            </v-col>

            <v-col cols="4">
               <v-select style="width: 322px;" v-model="form.gender" clearable label="Выберите пол" variant="solo"
                  :items="['Мужской', 'Женский']" />
               <v-select style="width: 322px;" v-model="city.value" clearable label="Выберите город" variant="solo"
                  :items="city.options" item-value="name" item-title="name" />
               <v-text-field style="width: 322px;" v-model="form.minYear" type="number" clearable
                  label="Минимальный допустимый возраст" variant="solo" />
               <v-text-field style="width: 322px;" v-model="form.maxYear" type="number" clearable
                  label="Максимальный допустимый возраст" variant="solo" />
               <v-text-field style="width: 322px;" v-model="form.personQty" type="number" clearable
                  label="Количество человек" variant="solo" />
            </v-col>
         </v-row>
      </v-card>

      <v-btn class="mt-8" color="success" @click="update">
         Сохранить
      </v-btn>
   </div>
</template>

<script setup>
import { mdiArrowDownCircle, mdiArrowUpCircle } from '@mdi/js';

const questions = ref([
   {
      text: '',
      id: null
   }
])
const city = reactive({
   value: null,
   options: []
})

const form = reactive({
   taskId: null,
   taskName: '',
   desc: '',
   gender: null,
   minYear: null,
   maxYear: null,
   personQty: null,
   city: null
})

onMounted(() => {
   fetchCities()
   fetchTask()
})

/* METHODS */
function changeQuestionOrder(direction, questionIndex) {
   arrayMove(questions.value, questionIndex, direction === 'up' ? questionIndex - 1 : questionIndex + 1)
}

function arrayMove(arr, fromIndex, toIndex) {
   const element = arr[fromIndex]
   arr.splice(fromIndex, 1)
   arr.splice(toIndex, 0, element)
}

function onAddQuestion() {
   questions.value.push({ text: '' })
}

async function fetchCities() {
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

async function fetchTask() {
   const route = useRoute()
   const query = await gql`
    query {
      task(id: ${route.params.id}) {
      id
      name
      text
      city
      min_age
      max_age
      sex
      questions {
        id
        text
        priority
      }
      }
    }
  `

   const res = await useAsyncQuery(query)
   const data = res?.data?.value?.task || []

   form.taskId = data.id
   form.taskName = data.name
   form.desc = data.text
   form.gender = data.sex || null
   form.minYear = data.min_age || null
   form.maxYear = data.max_age || null
   form.personQty = null
   city.value = data.city || null
   questions.value = data.questions.map(item => ({
      text: item.text,
      id: item.id
   }))
}

async function update() {
   const query = gql`
    mutation updateTask (
      $id: ID!
      $name: String!
      $text: String!
      $city: String
      $sex: String
      $min_age: Int
      $max_age: Int
      $questions: [QuestionInput]
    ) {
      updateTask(
        id: $id
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


   let needReload = true
   try {
      await useAsyncQuery(query, {
         id: form.taskId,
         name: form.taskName,
         text: form.desc,
         city: city.options.find(item => item.name === city.value)?.name || null,
         sex: form.gender,
         min_age: Number(form.minYear) || null,
         max_age: Number(form.maxYear) || null,
         questions: questions.value.map((item, index) => {
            return { text: item.text, priority: index + 1, id: item.id }
         })
      })
   } catch (e) {
      alert('произошла ошибка')
      needReload = false
   }

   if (needReload) {
      await fetchTask()
   }
}
</script>
<style scoped>
.question {
   display: flex;
   column-gap: 8px;
   width: fit-content;
   align-items: center;
}

.question-controls {
   display: flex;
   column-gap: 4px;
   padding-bottom: 24px;

}
</style>