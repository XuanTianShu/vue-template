<script setup lang="ts">
// Simple footer component
</script>

<template>
  <footer class="site-footer">
    <p>&copy; 2026 Anonymous Board. All rights reserved.</p>
  </footer>
</template>

<style scoped>
.site-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* 宽度占满整个屏幕 */
  text-align: center;
  padding: 1rem 15px;
  border-top: 1px solid var(--border-color, #e5e5e5);
  background-color: var(--card-bg-color, #ffffff);
  z-index: 100;
}

.site-footer p {
  margin: 0;
  color: var(--subtle-text-color, #666);
  font-size: 0.9rem;
}
</style>