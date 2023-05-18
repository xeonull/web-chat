<template>
  <div class="nav">
    <ul>
      <li v-for="link in links" :key="link">
        <a @click.prevent="onClick($event)" :class="{ active: link == activeLink, disabled: disabled }" href="/">{{ link }}</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
export default defineComponent({
  name: "v-select",

  props: {
    activeLink: {
      type: String,
      default: "",
    },
    links: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:selectedLink"],

  setup(props, { emit }) {
    const onClick = (event: Event): void => {
      if (props.disabled) return;
      const newValue = (event.target as HTMLLinkElement).textContent;
      if (props.activeLink !== newValue) emit("update:selectedLink", newValue);
    };

    return { onClick };
  },
});
</script>

<style lang="scss" scoped>
.nav {
  margin: 0;
  z-index: 10;
  opacity: 82%;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}
.nav ul {
  display: flex;
  flex-direction: row;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav ul li a {
  display: flex;
  padding: 15px 40px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  text-transform: uppercase;
  border-bottom: 1px solid rgb(145, 145, 145);
  @media (max-width: 600px) {
    padding: 15px 20px;
  }
  &.disabled {
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }
}
.nav ul li a.active {
  background: rgba(164, 89, 214, 0.63);
  color: rgb(255, 255, 255);
  &.disabled {
    color: rgba(255, 255, 255, 0.7);
  }
}
.nav ul li a:hover:not(.disabled) {
  background: rgba(209, 151, 248, 0.63);
  color: rgb(255, 255, 255);
}
</style>
