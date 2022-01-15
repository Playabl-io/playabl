<template>
  <BaseTemplate>
    <section>
      <p v-if="submitted" class="prose">Check your email to finish signing in!</p>
      <form v-else class="flex flex-col space-y-4" @submit.prevent="handleLogin">
        <Heading level="h1" as="h5">Sign in</Heading>
        <p class="prose">Sign in to join or start communities and play in games</p>
        <form-label class="flex flex-col text-sm font-bold">
          Email
          <form-input v-model="email" type="email" required />
        </form-label>
        <primary-button :isLoading="loading">Get your magic link</primary-button>
      </form>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import FormLabel from '@/components/Forms/FormLabel.vue'
import FormInput from '@/components/Forms/FormInput.vue'
import Heading from '@/components/Heading.vue';
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';
import { ref } from 'vue'
import { supabase } from '@/supabase'
import BaseTemplate from '@/components/BaseTemplate.vue';

const email = ref("")
const loading = ref(false)
const submitted = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signIn({ email: email.value })
    if (error) throw error
    submitted.value = true
  } catch (error) {
    alert(error?.error_description || error?.message)
  } finally {
    loading.value = false
  }
}
</script>