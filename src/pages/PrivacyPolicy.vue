<template>
  <BaseTemplate>
    <Heading as="h1" level="h1">Privacy Policy</Heading>
    <p class="text-xs text-slate-700 mt-2">Last updated: October 10th, 2023</p>
    <p class="prose mt-12">
      The information we collect about you is not sold or transferred to any
      third party except to provide services to you as part of your use of the
      site. The following companies and services are used by Playabl:
    </p>
    <ul class="mt-6 list-disc list-inside prose">
      <li>
        <a
          href="https://supabase.com/"
          target="_blank"
          rel="noreferrer noopener"
          >Supabase</a
        >
        for data storage and authentication
      </li>
      <li>
        <a
          href="https://www.mailjet.com/"
          target="_blank"
          rel="noreferrer noopener"
          >Mailjet</a
        >
        for transactional emails
      </li>
      <li>
        <a
          href="https://aws.amazon.com/"
          target="_blank"
          rel="noreferrer noopener"
          >AWS</a
        >
        for application services and processing
      </li>
      <li>
        <a
          href="https://newrelic.com/"
          target="_blank"
          rel="noreferrer noopener"
          >New Relic</a
        >
        for application and session error monitoring and reporting
      </li>
    </ul>
    <p class="prose mt-6">
      If you choose to sign up or sign in with Google, your Google email is
      shared with Playabl for purposes of authenticating you using Google's
      service.
    </p>
    <p class="prose mt-6">
      The information you provide to Playabl — such as preferred name, pronouns,
      and email — should be considered public and shared with the communities
      you join to faciliate communications. Please only reveal information you
      are comfortable with having available to others.
    </p>
    <p class="prose mt-6">
      For any questions or concerns, or to request account deletion, contact
      <a href="mailto:support@playabl.io">Playabl Support</a>.
    </p>
  </BaseTemplate>
</template>
<script setup lang="ts">
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import Heading from "@/components/Heading.vue";
</script>
