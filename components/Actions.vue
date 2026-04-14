<script setup>
import { ref } from 'vue'

/**
 * groups: Array of action group objects:
 *
 * Dropdown group:
 * {
 *   key: 'wolf',              // unique key, used for toggle state
 *   icon: 'iconoir-wolf',     // iconoir class for the trigger button (string = CSS class, object = Vue component)
 *   iconClass: 'aroma-text',  // optional extra CSS class on the icon element
 *   label: 'Link',            // label text for the trigger button
 *   items: [                  // submenu items
 *     { icon: 'iconoir-wolf', iconClass: 'aroma-text', label: 'Link', href: '#', classes: 'some-class' },
 *   ]
 * }
 *
 * Plain link (no submenu):
 * {
 *   key: 'settings',
 *   icon: 'iconoir-settings',
 *   label: 'Settings',
 *   href: '#add-family-finances',
 *   id: 'admin-menu-toggle',  // optional
 *   classes: 'aroma-bg aroma-dark-bg-hover', // optional extra classes
 * }
 */
const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
})

const openGroup = ref(null)

function toggleGroup(key) {
  openGroup.value = openGroup.value === key ? null : key
}

function closeAll() {
  openGroup.value = null
}
</script>

<template>
    <div id="actions" @mouseleave="closeAll">
        <ul class="menu action-groups">

            <li v-for="group in groups" :key="group.key" class="action-group">

                <!-- Dropdown group -->
                <template v-if="group.items">
                    <a
                        class="action-btn"
                        :class="[{ clicked: openGroup === group.key }, group.classes]"
                        @mousedown.prevent="toggleGroup(group.key)"
                    >
                        <component :is="group.icon" class="icon" :class="group.iconClass"/>
                        <span class="label">{{ group.label }}</span>
                    </a>

                    <ul class="menu actions" v-show="openGroup === group.key">
                        <li v-for="(item, i) in group.items" :key="i" class="action">
                            <a
                                :href="item.onClick ? '#' : (item.href ?? '#')"
                                :class="item.classes"
                                @click.prevent="item.onClick ? item.onClick() : null"
                            >
                                <component :is="item.icon" v-if="item.icon" class="icon" :class="item.iconClass"/>
                                {{ item.label }}
                            </a>
                        </li>
                    </ul>
                </template>

                <!-- Plain link / callback -->
                <template v-else>
                    <a
                        :id="group.id"
                        :href="group.onClick ? '#' : (group.href ?? '#')"
                        :class="group.classes"
                        @click.prevent="group.onClick ? group.onClick() : null"
                    >
                        <component :is="group.icon" class="icon" :class="group.iconClass"/>
                        <span class="label">{{ group.label }}</span>
                    </a>
                </template>

            </li>

        </ul>
    </div>
</template>