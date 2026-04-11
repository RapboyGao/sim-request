<template>
  <v-container class="py-8 booking-page">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <v-card class="pa-6 pt-8 sticky-card">
          <BookingForm />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.booking-page {
  min-height: 100vh;
}

.sticky-card {
  max-width: 720px;
  margin: 0 auto;
}

@media (min-width: 600px) {
  .sticky-card {
    margin-top: 0.5rem;
  }
}
</style>
