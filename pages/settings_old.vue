<template>
  <div class="settings">
    <p class="text-h3">Настройки</p>
    <div class="settings-block">
      <v-card
          class="mt-8"
          style="padding: 16px"
          elevation="1"
      >
        <v-row>
          <v-col cols="6">
            {{ eventTexts }}
            <p class="mb-4">Текст после выполнения задания:</p>
            <v-text-field
                v-model="form.text"
                clearable
                placeholder="Введите текст"
                variant="solo"
            />
            <v-btn
                class="mb-3"
                color="success"
                elevation="1"
            >Сохранить</v-btn>

            <p class="mb-4">Текст после успешной регистрации:</p>
            <v-text-field
            v-model="form.successReg"
            clearable
            placeholder="Введите текст"
            variant="solo"
            />
            <v-btn
                class="mb-3"
                color="success"
                elevation="2"
            >Сохранить</v-btn>

            <p class="mb-4">Текст после ввода команды /start</p>
            <v-text-field
            v-model="form.textStart"
            clearable
            placeholder="Введите текст"
            variant="solo"
            />
            <v-btn
                class="mb-3"
                color="success"
                elevation="2"
            >Сохранить</v-btn>
          </v-col>

          <v-col cols="6">
            <p class="mb-3">Список городов</p>
            <div class="test d-flex"  v-for="(city, index) of cities"
                 :key="index">
              <v-text-field
                  v-model="city.name"
                  clearable
                  label="Введите текст"
                  variant="solo"
              />
              <v-btn class="ml-2 mt-3" color="error" dark>Удалить</v-btn>
            </div>

            <VBtn
                color="success"
                @click="onAddCity"
            >
              Добавить город
            </VBtn>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </div>
</template>

<script setup>
const cities = ref([])

const eventTexts = ref([])

const form = reactive({
  successReg: '',
  textStart: '',
})

onMounted(async () => {
  await fetchCities()
  await fetchEventTexts()
})

/* METHODS */
async function fetchCities () {
  const query = await gql`
    query {
      cities (is_delete: false) {
        data {
          name,
          id
        }
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.cities?.data || []

  cities.value = data.map(item => ({
    name: item.name
  }))
}

async function fetchEventTexts () {
  const query = await gql`
    query {
      eventTexts {
      id
      event
      text
      }
    }
  `

  const res = await useAsyncQuery(query)
  const data = res?.data?.value?.eventTexts || []

  eventTexts.value = data.map(item => ({
    text: item.text,
    event: JSON.parse(item.event)
  }))

}

function onAddCity () {
  cities.value.push({ textCity: '' })
}
</script>
