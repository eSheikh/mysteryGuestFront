<template>
  <div class="settings">
    <v-row>
      <v-col cols="6">
        <v-card style="padding: 20px">
          <v-text-field
              style="width: 450px;"
              v-for="item of texts"
              :key="item.id"
              v-model="item.text"
              clearable
              :label="item.label"
              variant="solo"
              class="mb-4"
          />
          <v-btn
              color="success"
              @click="onSaveTexts">
            Сохранить
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card style="padding: 20px">
          <p>Список городов</p>

          <div
              v-for="city of cities"
              :key="city.name"
              class="test mt-4"
          >
            <v-text-field
                v-model="city.name"
                clearable
                variant="solo"
            />

            <v-btn
              style="height: 56px; background: indianred; color: #fff"
              class="ml-4"
              @click="deleteCity(city.id)"
            >Удалить</v-btn>
          </div>

          <v-btn
              color="success"
              @click="addCityModal = true"
              class="mt-4"
          >
            Добавить
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="addCityModal" style="">
      <v-card style="padding: 20px; width: 500px; margin: 0 auto;">
        <p>Добавить город</p>

        <v-text-field
            label="Название города"
            v-model="newCityName"
            clearable
            variant="solo"
            class="mt-4"
        />

        <v-btn class="mt-4" color="success" @click="onAddCity">
          Добавить
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const addCityModal = ref(false)
const newCityName = ref('')

const cities = ref([])

const texts = ref([])

onMounted(() => {
  fetchCities()
  fetchTexts()
})

/* METHODS */
async function fetchTexts () {
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

  console.log(res?.data?.value?.eventTexts)


  texts.value = (res?.data?.value?.eventTexts || []).map(item => {
    const json = JSON.parse(item.event)

    return {
      id: json.value,
      label: json.description,
      text: item.text
    }
  })
}

async function onSaveTexts () {
  texts.value.forEach(async (item) => {
    const query = await gql`
      mutation {
        updateEventText(event: ${item.id}, text: "${item.text}") {
          id
        }
      }
    `

    await useAsyncQuery(query)
  })
}

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
    id: item.id,
    name: item.name
  }))
}

async function deleteCity (id) {
  const query = await gql`
    mutation {
      deleteCity(id: ${id}) {
        id
      }
    }
  `

  try {
    await useAsyncQuery(query)

    fetchCities()
  } catch (e) {
    alert('Произошла ошибка!')
  }
}

async function onAddCity () {
  const query = await gql`
    mutation {
      createCity(name: "${newCityName.value}") {
        id
      }
    }
  `

  try {
    await useAsyncQuery(query)

    addCityModal.value = false
    newCityName.value = ''

    fetchCities()
  } catch (e) {
    alert('Произошла ошибка!')
  }
}
</script>

<style lang="scss" scoped>
.settings {
  .input-width {
    width: 50% !important;
  }
  .test {
    display: flex;
    justify-content: space-between;
  }
}
</style>
