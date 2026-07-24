<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})
</script>

<template>
  <UPageBody>
    <UPageHeader title="Admin Dashboard"  />
    <UPageHero />
  </UPageBody>
</template>

