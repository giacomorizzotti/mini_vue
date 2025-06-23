import { ref } from 'vue'

const modalVisibility = ref(false)
const modalClass = ref('hidden')

export function useModal() {

    function modalVisibilityToggle () {
        modalVisibility.value = !modalVisibility.value
        if ( modalVisibility.value == true ) modalClass.value = 'shown'
        else return modalClass.value = 'hidden'
    }

    function modalVisibilityHide () {
        modalVisibility.value = false
        modalClass.value = 'hidden'
    }

    function modalVisibilityShow () {
        modalVisibility.value = true
        modalClass.value = 'shown'
    }

    return { modalVisibility, modalClass, modalVisibilityToggle, modalVisibilityHide, modalVisibilityShow }
}