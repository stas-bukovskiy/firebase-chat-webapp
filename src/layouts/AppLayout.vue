<script setup lang="ts">

import MenuComponent from "@/components/MenuComponent.vue";
</script>

<template>
  <main>
    <div class="sidebar">
      <MenuComponent/>
    </div>
    <div class="content">
      <div class="content-inner">
        <router-view/>
      </div>
    </div>
  </main>
</template>

<style scoped>
.sidebar {
  margin: 0;
  padding: 48px calc(48px - 1rem) 48px 48px;
  width: 400px;
  position: fixed;
  height: 100%;
  overflow: auto;
}

div.content {
  margin-left: 400px;
  padding: 1px 0;
  min-height: 100vh;
}

.content-inner {
  background-color: #272727;
  margin: 24px 24px 24px 0;
  border-radius: 24px;
  padding: 24px;
  height: calc(100vh - 50px);
}

@media screen and (max-width: 700px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .sidebar a {
    float: left;
  }

  div.content {
    margin-left: 0;
  }
}

@media screen and (max-width: 400px) {
  .sidebar a {
    text-align: center;
    float: none;
  }
}
</style>