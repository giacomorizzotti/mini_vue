# mini_vue

Vue 3 components and composables for the mini framework, converted from the original mini.js utility library. Projects use it through a symlink at `src/mini`; it isn't an npm package.

`CLAUDE.md` in this directory has the full reference for every component and composable.

## Directory Structure

```
mini/
├── components/    41 .vue components, exported from components/index.js (all except LanguageSwitcher)
├── composables/   composition functions, exported from composables/index.js
├── directives/    imageCover.js
├── pages/         CookiePolicy.vue, PrivacyPolicy.vue
├── stores/        auth.js, config.js (Pinia)
├── views/         LoginView.vue
├── locale.js      @/mini/locale: useLocale, detectInitialLocale, localeRoute, LanguageSwitcher
└── README.md
```

## Importing

Import each file directly. This works in every project:

```javascript
import Box from '@/mini/components/Box.vue'
import { useCookies } from '@/mini/composables/useCookies'
```

The barrels (`@/mini/components`, `@/mini/composables`) are shorter. The locale code has its own entry point, because it needs `vue-i18n` and `@/config/locale`:

```js
import { useLocale, detectInitialLocale, localeRoute, LanguageSwitcher } from '@/mini/locale'
```

Some files expect the project to provide a config module:

| Used by | The project must provide |
|---|---|
| `stores/auth.js` | `@/config/auth` |
| `views/LoginView.vue` | `@/config/auth`, including `OAUTH_AUTHORIZE_ENDPOINT` |
| `pages/PrivacyPolicy.vue`, `pages/CookiePolicy.vue` | `@/config/owner` |
| `useLocale`, `LanguageSwitcher` | `@/config/locale` and `vue-i18n` |

## Common Composables

These are the ones ported from mini.js. `CLAUDE.md` lists the rest, including the calendar, Markdown and drag-and-drop composables.

### useMobileDetection
Detects mobile devices and provides reactive state.

```javascript
import { useMobileDetection } from '@/mini/composables/useMobileDetection'

const { isMobile, isDesktop, mobileCheck } = useMobileDetection()
```

### useCookies
Manage browser cookies easily.

```javascript
import { useCookies } from '@/mini/composables/useCookies'

const { setCookie, readCookie, deleteCookie } = useCookies()
setCookie('username', 'john', 30)
```

### useScrollDetection
Track scroll position and direction.

```javascript
import { useScrollDetection } from '@/mini/composables/useScrollDetection'

const { isScrolled, isTop, scrollY, scrollDirection } = useScrollDetection(80)
```

### useScrollState
Provides reactive scroll state classes for styling.

```javascript
import { useScrollState } from '@/mini/composables/useScrollState'

const { scrollClass } = useScrollState()
```

### useClassManipulation
DOM class manipulation utilities.

```javascript
import { useClassManipulation } from '@/mini/composables/useClassManipulation'

const { addClass, removeClass, toggleClass, collapse, showElement, hideElement } = useClassManipulation()
```

### useImageCover
Make images cover their container maintaining aspect ratio.

```javascript
import { useImageCover } from '@/mini/composables/useImageCover'

const { applyCover, applyFullHdRatio } = useImageCover()
```

### useWebsiteSettings
Manage application settings via cookies.

```javascript
import { useWebsiteSettings } from '@/mini/composables/useWebsiteSettings'

const { settings, setSetting, getSetting } = useWebsiteSettings()
```

### useMenuState
Provides reactive menu state management.

```javascript
import { useMenuState } from '@/mini/composables/useMenuState'

const { isMenuOpen, menuStateClass, menuOpen, menuClose, menuToggle } = useMenuState()
```

### useMessage
Message/notification state management, shown by the `MessageBox` component.

```javascript
import { useMessage } from '@/mini/composables/useMessage'

const { showSuccessMessage, showDangerMessage } = useMessage()
showSuccessMessage('Saved')
```

## Key Components

### Box and Boxes
The layout grid. `size` sets a box's width, and `padding` and `margin` become mini's `p-*` and `m-*` classes.

```vue
<Boxes gap="2" padding="1">
  <Box :size="50" padding="2" margin="auto">...</Box>
  <Box :size="50" :padding="0">...</Box>
</Boxes>
```

Both props accept `0`, `025`, `05`, `075`, `1`, `15`, `2`, `25`, `3`, `4` and `5`. `margin` also accepts `-1`, `-075`, `-05`, `-025` and `auto`. Write labels with a leading zero as strings, like `padding="05"`.

### Button
`size` accepts `XS`, `S`, `L`, `XL` and `XXL`. It also accepts lowercase and long forms such as `xs` or `small`, but always outputs the uppercase class, because mini's size classes are uppercase only.

```vue
<Button color="info" size="L" text="Large button"/>
```

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
Animated starry background, styled by mini.css.

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

## Design Philosophy

- **Classes first**: components rely on mini.css. A few still need inline styles or scoped rules, such as `Modal` and `SubNavigation`
- **Composable-first**: logic is extracted into reusable composables
- **Component composition**: components use other mini components (Box, Button, Modal, etc.)

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

- Components use `<script setup>` syntax and the Composition API
- Event listeners are cleaned up on unmount
- Components stay in separate .vue files, as SFC templates require
