<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

const props = defineProps({
  menuToggleOnClick: {
    type: [Boolean],
    default: false
  },
  direction: {
    type: [String],
    default: 'row'
  },
  invert: {
    type: [Boolean],
    default: null
  }
})

const directionClass = computed(() => {
  const classes = []
  if (props.direction === 'row') {
    classes.push('row')
  }
  return classes
})

const menuClass = computed(() => {
  const classes = [ scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})

const menuItems = ref([])
const activeSection = ref(null)

function updateMenuItems() {
  menuItems.value = []
  const sections = document.querySelectorAll('section.page-menu')
  if (sections.length > 0) {
    for (let section of sections) {
      menuItems.value.push({
        title: section.getAttribute('title'),
        link: '#' + section.id,
        id: section.id
      })
    }
  }
}

// Intersection Observer to track active section
let observer = null
function observeSections() {
  if (observer) observer.disconnect()
  const sections = document.querySelectorAll('section.page-menu')
  observer = new window.IntersectionObserver(
    (entries) => {
      // Find the first section that is intersecting (visible)
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible.length > 0) {
        activeSection.value = visible[0].target.id
      } else {
        activeSection.value = null // Remove active if none is visible
      }
    },
    {
      threshold: [0.3, 0.6, 1.0],
      rootMargin: '0px 0px -40% 0px'
    }
  )
  sections.forEach(section => observer.observe(section))
}

const route = useRoute()

onMounted(() => {
  setTimeout(() => {
    updateMenuItems()
    observeSections()
  }, 0)
})

watchEffect(() => {
  setTimeout(() => {
    updateMenuItems()
    observeSections()
  }, 0)
})
</script>

<template>
  <nav class="menu" :class="menuClass">
    <ul class="menu" :class="directionClass">
      <li
        v-for="item in menuItems"
        class="item"
        :class="{ active: activeSection === item.id }"
        :key="item.id"
      >
        <a :href="item.link">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
nav.menu {
  display: flex;
  margin: var(--margin) 0;
  ul.menu {
    list-style-type: none;
    display: flex;
    margin: 0;
    padding: 0 var(--padding);
    flex-flow: column nowrap;
    &.column {
      flex-flow: column nowrap;
    }
    &.row {
      flex-flow: row wrap;
    }
    li.item, li.menu-item {
      display: block;
      font-weight: 700;
      font-size: var(--h5);
      line-height: 1.5;
      margin:0;
      background: transparent;
      padding:0;
      @media only screen and (min-width: 576px) {
        font-size: var(--h4);
      }
      @media only screen and (min-width: 768px) {
        font-size: var(--h6);
        padding: calc(var(--padding)*.5) calc(var(--padding)*.75);
      }
      a {
        display: block;
        position: relative;
        padding: var(--padding);
        margin: calc(var(--margin) * 0.5 ) 0;
        @media only screen and (min-width: 576px) {
          padding: calc(var(--padding) * 0.75 );
          margin: calc(var(--margin) * 0.75 ) 0;
        }
        @media only screen and (min-width: 768px) {
          color: var(--black);
          display: inline-block;
          margin: 0;
          padding: 0;
        }
        &::after {
          content:"";
          display: block;
          position: absolute;
          height: 2px;
          width: 0;
          background-color: var(--white);
          bottom: -2px;
          left:0;
          transition: background-color 0.25s ease, width 0.25s ease;
          border-radius: 2px;
          @media only screen and (min-width: 768px) {
            background: var(--link-link-color);
          }
        }
      }
      &.active > a, &.selected > a, &.router-link-active > a, a.active, a.selected, a.router-link-active {
        background-color: var(--link-hover-color);
        color: var(--white);
        @media only screen and (min-width: 768px) {
          color: var(--link-hover-color);
          background-color: transparent;
        }
        &::after {
          width: 0;
          background-color: var(--link-hover-color);
          @media only screen and (min-width: 768px) {
            width: 100%;
            background-color: var(--link-hover-color);
          }
        }
      }
      &:hover > a {
        background-color: var(--link-color);
        color: var(--white);
        @media only screen and (min-width: 768px) {
          color: var(--link-color);
          background-color: transparent;
        }
        &::after {
          width: 0;
          background-color: var(--link-color);
          @media only screen and (min-width: 768px) {
            width: 100%;
            background-color: var(--link-color);
          }
        }
      }
    }
  }
}
header#header, aside {
  nav.menu {
    &.open-menu {
      ul.menu {
        li.item {
          a {
            color: var(--white);
            &::after {
              background: var(--white);
            }
          }
          &.active > a, &.selected > a, &.router-link-active > a, a.active, a.selected, a.router-link-active {
            background-color: var(--light-grey);
            color: var(--white);
            @media only screen and (min-width: 768px) {
              color: var(--light-grey);
              background-color: transparent;
            }
            &::after {
              width: 0;
              background-color: var(--light-grey);
              @media only screen and (min-width: 768px) {
                width: 100%;
                background-color: var(--light-grey);
              }
            }
          }
          &:hover > a {
            color: var(--link-color);
            background-color: transparent;
            &::after {
              width: 100%;
              background-color: var(--link-color);
            }
          }
        }
      }
    }
    &.invert {
      --black: var(--white); 
    }
    &.invert-top.top {
      --black: var(--white); 
    }
    &.invert-scrolled.scrolled {
      --black: var(--white); 
    }
  }
}
// main menu
#main-menu {
  li.item, li.menu-item {
    font-size: var(--h4);
    a {
      color: var(--white);
      &::after {
        height: 4px;
        bottom: -4px;
      }
    }
    ul.sub-menu {
      li {
        font-size: var(--h4);
      }
    }
  }
}
// page menu
#page-menu ul {
  display: flex;
  position: fixed;
  transform: rotate(-90deg) translate(0, -100%);
  flex-flow: row-reverse wrap;
  justify-content: flex-start;
  transform-origin: top right;
  width: 100vh;
  top: 0;
  right: 0;
  height: auto;
  padding-right: calc((var(--menu-toggle-height)) + (var(--padding) * 2) + (var(--padding) * 1));
  @media only screen and (min-width: 768px) {
    position: relative;
    transform: none;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
    width: auto;
    top: 0;
    right: 0;
    height: auto;
    padding-right: var(--padding);
  }
  li {
    &.item, &.menu-item {
      font-weight: 300;
    }
  }
}
</style>
