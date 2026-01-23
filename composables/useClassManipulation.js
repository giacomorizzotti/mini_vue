/**
 * Composable for DOM class manipulation utilities
 * @returns {Object} Class manipulation functions
 */
export function useClassManipulation() {
  /**
   * Add a class to target elements
   * @param {string} targetElement - CSS selector
   * @param {string} classToAdd - Class to add
   * @param {string|null} classToRemove - Optional class to remove
   */
  const addClass = (targetElement, classToAdd, classToRemove = null) => {
    const elements = document.querySelectorAll(targetElement)
    elements.forEach(element => {
      if (!element.classList.contains(classToAdd)) {
        element.classList.add(classToAdd)
      }
      if (classToRemove && element.classList.contains(classToRemove)) {
        element.classList.remove(classToRemove)
      }
    })
  }

  /**
   * Remove a class from target elements
   * @param {string} targetElement - CSS selector
   * @param {string} classToRemove - Class to remove
   * @param {string|null} classToAdd - Optional class to add
   */
  const removeClass = (targetElement, classToRemove, classToAdd = null) => {
    const elements = document.querySelectorAll(targetElement)
    elements.forEach(element => {
      if (element.classList.contains(classToRemove)) {
        element.classList.remove(classToRemove)
      }
      if (classToAdd && !element.classList.contains(classToAdd)) {
        element.classList.add(classToAdd)
      }
    })
  }

  /**
   * Toggle a class on target elements
   * @param {string} elementToLookFor - CSS selector
   * @param {string} classToToggle - Class to toggle
   * @param {string|null} invertClassToToggle - Optional inverse class to toggle
   */
  const toggleClass = (elementToLookFor, classToToggle, invertClassToToggle = null) => {
    const elements = document.querySelectorAll(elementToLookFor)
    elements.forEach(element => {
      if (element.classList.contains(classToToggle)) {
        element.classList.remove(classToToggle)
        if (invertClassToToggle && !element.classList.contains(invertClassToToggle)) {
          element.classList.add(invertClassToToggle)
        }
      } else {
        element.classList.add(classToToggle)
        if (invertClassToToggle && element.classList.contains(invertClassToToggle)) {
          element.classList.remove(invertClassToToggle)
        }
      }
    })
  }

  /**
   * Collapse/expand elements with show/hidden classes
   * @param {string} targetObject - CSS selector
   */
  const collapse = (targetObject) => {
    const elements = document.querySelectorAll(targetObject)
    elements.forEach(element => {
      if (!element.classList.contains('hidden') && !element.classList.contains('shown')) {
        element.classList.add('shown')
      }
    })
    toggleClass(targetObject, 'shown', 'hidden')
  }

  /**
   * Show element (remove hidden, add shown)
   * @param {string} targetObject - CSS selector
   */
  const showElement = (targetObject) => {
    removeClass(targetObject, 'hidden')
    addClass(targetObject, 'shown')
  }

  /**
   * Hide element (remove shown, add hidden)
   * @param {string} targetObject - CSS selector
   */
  const hideElement = (targetObject) => {
    removeClass(targetObject, 'shown')
    addClass(targetObject, 'hidden')
  }

  return {
    addClass,
    removeClass,
    toggleClass,
    collapse,
    showElement,
    hideElement
  }
}
