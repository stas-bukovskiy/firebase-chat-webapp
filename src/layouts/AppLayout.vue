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
  padding: 0.6rem 1.2rem 1.4rem 1.4rem;
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
  margin: 1.4rem 1.4rem 1.4rem 0;
  border-radius: 16px;
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