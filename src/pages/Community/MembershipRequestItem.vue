<template>
  <div class="p-4">
    <LoadingSpinner v-if="isValidating" color="white" />
    <template v-else>
      <div v-if="data" class="flex items-start">
        <UserAvatar
          :username="data.username || data.email"
          :avatar-url="data.avatar_url"
        />
        <div class="grid text-left ml-4">
          <p class="font-semibold truncate w-full">
            {{ data.username || data.email }}
          </p>
          <p v-if="data.username" class="text-slate-700 text-sm">
            {{ data.email }}
          </p>
        </div>
        <FormSelect id="role" v-model.number="roleToAssign" class="ml-auto">
          <option :value="ROLES.admin">Admin</option>
          <option :value="ROLES.creator">Creator</option>
          <option selected :value="ROLES.player">Player</option>
        </FormSelect>
      </div>
      <Well v-if="request.message" class="mt-3">
        <p class="prose">
          {{ request.message }}
        </p>
      </Well>
      <div class="flex justify-end gap-4 mt-3">
        <component
          :is="denyComponent"
          :disabled="saving || denying"
          :is-loading="denying"
          class="transition-colors"
          @click="handleDenyClick"
        >
          {{ confirmDeny ? "Are you sure?" : "Deny" }}
        </component>
        <PrimaryButton
          :disabled="denying || saving"
          :is-loading="saving"
          @click="approveRequest"
          >Approve</PrimaryButton
        >
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import useSWRV from "swrv";
import { loadProfile } from "@/api/profiles";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import Well from "@/components/Well.vue";
import { CommunityMembershipRequest } from "@/typings/CommunityMembership";
import { Profile } from "@/typings/Profile";
import { ROLES } from "@/util/roles";
import { processMembershipRequest } from "@/api/communityMemberships";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import WarningButton from "@/components/Buttons/WarningButton.vue";

const { showSuccess, showError } = useToast();

const props = defineProps({
  request: {
    type: Object as PropType<CommunityMembershipRequest>,
    required: true,
  },
});

const emit = defineEmits<{ (event: "remove", requestId: number): void }>();

const roleToAssign = ref<ROLES>(ROLES.player);

const { data, isValidating } = useSWRV<Profile>(
  props.request.user_id,
  loadProfile
);

const saving = ref(false);
const denying = ref(false);
const confirmDeny = ref(false);

const denyComponent = computed(() =>
  confirmDeny.value ? WarningButton : SecondaryButton
);

function handleDenyClick() {
  if (confirmDeny.value) {
    denyRequest();
  } else {
    confirmDeny.value = true;
  }
}

async function approveRequest() {
  saving.value = true;
  try {
    await processMembershipRequest({
      requestId: props.request.id,
      userId: props.request.user_id,
      communityId: props.request.community_id,
      role: roleToAssign.value,
      action: "approve",
    });
    showSuccess({ message: "Request approved" });
    emit("remove", props.request.id);
  } catch (error) {
    log({ error });
    showError({ message: "Unable to complete request" });
  } finally {
    saving.value = false;
  }
}

async function denyRequest() {
  denying.value = true;
  try {
    await processMembershipRequest({
      requestId: props.request.id,
      userId: props.request.user_id,
      communityId: props.request.community_id,
      role: roleToAssign.value,
      action: "deny",
    });
    emit("remove", props.request.id);
  } catch (error) {
    log({ error });
    showError({ message: "Unable to complete request" });
  } finally {
    denying.value = false;
  }
}
</script>
