# Mini.js Vue Components & Composables

This directory contains Vue 3 components and composables converted from the original mini.js utility library.

## Directory Structure

```
mini/
├── composables/       # Reusable composition functions (all in index.js)
│   ├── useMobileDetection.js
│   ├── useCookies.js
│   ├── useScrollDetection.js
│   ├── useScrollState.js
│   ├── useClassManipulation.js
│   ├── useImageCover.js
│   ├── useWebsiteSettings.js
│   ├── useMenuState.js
│   ├── useMessage.js
│   └── index.js
├── components/        # Vue components
│   ├── Layout: Aside, Box, Boxes, Container, Footer, Header, Main, Section, etc.
│   ├── Navigation: Menu, MenuToggle, DropdownMenu, PageMenu, etc.
│   ├── UI: Button, Loader, Modal, StarsBackground, VibingText, etc.
│   ├── Pagination: Pagination, PaginatedList
│   ├── Forms: ConfirmDialog, LoginForm, GDPR
│   └── index.js (exports all 38+ components)
└── README.md
```

## Composables (9 Total)

All composables are exported from a single `index.js` file using ES6 re-exports.

### useMobileDetection
Detects mobile devices and provides reactive state.

```javascript
import { useMobileDetection } from '@/mini/composables'

const { isMobile, isDesktop, mobileCheck } = useMobileDetection()
```

### useCookies
Manage browser cookies easily.

```javascript
import { useCookies } from '@/mini/composables'

const { setCookie, readCookie, deleteCookie } = useCookies()
setCookie('username', 'john', 30)
```

### useScrollDetection
Track scroll position and direction.

```javascript
import { useScrollDetection } from '@/mini/composables'

const { isScrolled, isTop, scrollY, scrollDirection } = useScrollDetection(80)
```

### useScrollState
Provides reactive scroll state classes for styling.

```javascript
import { useScrollState } from '@/mini/composables'

const { scrollClass } = useScrollState()
```

### useClassManipulation
DOM class manipulation utilities.

```javascript
import { useClassManipulation } from '@/mini/composables'

const { addClass, removeClass, toggleClass, collapse, showElement, hideElement } = useClassManipulation()
```

### useImageCover
Make images cover their container maintaining aspect ratio.

```javascript
import { useImageCover } from '@/mini/composables'

const { applyCover, applyFullHdRatio } = useImageCover()
```

### useWebsiteSettings
Manage application settings via cookies.

```javascript
import { useWebsiteSettings } from '@/mini/composables'

const { settings, setSetting, getSetting } = useWebsiteSettings()
```

### useMenuState
Provides reactive menu state management.

```javascript
import { useMenuState } from '@/mini/composables'

const { menuStateClass } = useMenuState()
```

### useMessage
Message/notification state management.

```javascript
import { useMessage } from '@/mini/composables'

// Check implementation for specific usage
```

## Key Components

### Pagination
Simple Previous/Next pagination using your Button component.

```vue
<Pagination 
  v-model:currentPage="page"
  :totalPages="10"
/>
```

### PaginatedList
Wrapper component that handles pagination logic automatically.

```vue
<PaginatedList :items="allItems" :itemsPerPage="30">
  <template #default="{ paginatedItems }">
    <div v-for="item in paginatedItems" :key="item.id">
      {{ item.name }}
    </div>
  </template>
</PaginatedList>
```

### Loader
Full-page loader with optional logo.

```vue
<Loader :logoUrl="'/logo.png'" />
```

### StarsBackground
Animated starry background (no inline styles, uses mini.css).

```vue
<StarsBackground>
  <YourContent />
</StarsBackground>
```

### PageMenu
Auto-generated navigation from page sections using Intersection Observer.

```vue
<PageMenu 
  :menuToggleOnClick="false"
  direction="row"
/>
<!-- Automatically detects sections with class="page-menu" -->
```

### Modal
Reusable modal with Esc key, click-outside, and scroll lock.

```vue
<Modal :visible="showModal" @close="showModal = false">
  <YourContent />
</Modal>
```

### ConfirmDialog
Programmatic confirmation modal using Promise API.

```vue
<template>
  <ConfirmDialog 
    ref="confirmDialog"
    message="Delete this item?"
    confirmText="Delete"
    cancelText="Cancel"
  />
</template>

<script setup>
import { ref } from 'vue'
const confirmDialog = ref(null)

async function handleDelete() {
  const confirmed = await confirmDialog.value.show()
  if (confirmed) {
    // User confirmed
  }
}
</script>
```

### DropdownMenu
Dropdown menu with hover/click support and mobile detection.

```vue
<DropdownMenu label="Menu" :hoverOpen="true" :hoverClose="true">
  <li><a href="#">Item 1</a></li>
  <li><a href="#">Item 2</a></li>
</DropdownMenu>
```

## Installation in Your Project

### Import composables:
```javascript
// All composables in one import
import { 
  useMobileDetection, 
  useCookies, 
  useScrollDetection,
  useMenuState 
} from '@/mini/composables'
```

### Import components:
```vue
import { 
  Pagination, 
  PaginatedList, 
  Loader, 
  Modal,
  ConfirmDialog 
} from '@/mini/components'
```

### Global registration (optional):
```javascript
// main.js
import * as MiniComponents from '@/mini/components'

Object.entries(MiniComponents).forEach(([name, component]) => {
  app.component(name, component)
})
```

## Design Philosophy

- **No inline styles**: All components rely on your mini.css for styling
- **Empty `<style scoped>` blocks**: Components use class-based styling
- **Composable-first**: Logic extracted into reusable composables
- **Component composition**: Components use other mini components (Box, Button, Modal, etc.)
- **Barrel exports**: Single import point for all composables and components

## Migration from mini.js

| mini.js Function | Vue Equivalent |
|-----------------|----------------|
| `mobileCheck()` | `useMobileDetection().mobileCheck()` |
| `setCookie()` | `useCookies().setCookie()` |
| `pagination()` | `<Pagination>` or `<PaginatedList>` |
| `loaderGone()` | `<Loader>` component |
| `addClass()` | `useClassManipulation().addClass()` |
| `imageCover()` | `useImageCover().applyCover()` |
| `starsBackground()` | `<StarsBackground>` component |
| `menuToggle()` | `<MenuToggle>` component |
| `buildPageMenu()` | `<PageMenu>` component |

## Notes

- All composables are reactive and use Vue 3 Composition API
- Components use `<script setup>` syntax
- Event listeners are automatically cleaned up on unmount
- All styling through mini.css - no scoped styles used
- Composables consolidated in single index.js using re-exports
- Components remain in separate .vue files (required for SFC template syntax)
