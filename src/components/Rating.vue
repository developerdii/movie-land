<template>
  <p>
    <i class="fas fa-star" style="color: orange"></i> {{ value.toFixed(1) + ' / 10' }}
  </p>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0
    }
  }
}
</script>