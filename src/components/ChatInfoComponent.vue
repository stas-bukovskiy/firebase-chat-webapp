<script setup lang="ts">
import {type PropType, ref, watch} from "vue";
import type {ChatAggregate} from "@/models/entities.ts";
import ChatInfoMainPageComponent from "@/components/ChatInfoMainPageComponent.vue";
import {Pages} from "@/models/enums.ts";
import ChatInfoFilesPageComponent from "@/components/ChatInfoFilesPageComponent.vue";

const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>,
})

const currentPage = ref<Pages>(Pages.MAIN);

const navigateTo = (page: Pages) => {
  currentPage.value = page;
}

const back = () => {
  currentPage.value = Pages.MAIN;
}

watch(() => props.chatAgg, () => {
  currentPage.value = Pages.MAIN;
})

</script>

<template>
  <ChatInfoMainPageComponent v-if="currentPage === Pages.MAIN" :chatAgg="chatAgg"
                             @navigateTo="navigateTo"/>
  <ChatInfoFilesPageComponent v-else-if="currentPage === Pages.MEDIA" :chatAgg="chatAgg" :pageType="Pages.MEDIA"
                              @back="back"/>
  <ChatInfoFilesPageComponent v-else-if="currentPage === Pages.FILES" :chatAgg="chatAgg" :pageType="Pages.FILES"
                              @back="back"/>
</template>

<style scoped>

</style>