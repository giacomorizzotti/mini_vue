import { onMounted } from 'vue'

export function useStarsBackground() {
  const applyStarsBackground = (target = '.stars-bg') => {
    const starsBg = document.querySelectorAll(target)

    starsBg.forEach(stars => {
      if (stars.querySelector('#stars1')) return

      const divStarOne = document.createElement('div')
      const divStarTwo = document.createElement('div')
      const divStarThree = document.createElement('div')

      divStarOne.id = 'stars1'
      divStarTwo.id = 'stars2'
      divStarThree.id = 'stars3'

      stars.prepend(divStarThree)
      stars.prepend(divStarTwo)
      stars.prepend(divStarOne)
    })
  }

  onMounted(() => {
    applyStarsBackground()
  })

  return {
    applyStarsBackground
  }
}