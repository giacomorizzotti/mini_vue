export default {
  mounted(el) {
    function imageCover() {
      el.style.position = 'absolute';
      el.style.top = '50%';
      el.style.left = '50%';
      el.style.transform = 'translate(-50%, -50%)';

      let elementWrapper = el.parentNode;
      let imageWidth = el.offsetWidth;
      let imageHeight = el.offsetHeight;
      let parentWidth = elementWrapper.offsetWidth;
      let parentHeight = elementWrapper.offsetHeight;

      let wrapperRatio = parentWidth / parentHeight;
      let imgRatio = imageWidth / imageHeight;

      elementWrapper.style.overflow = "hidden";
      elementWrapper.style.position = "relative";

      if (wrapperRatio >= 1) {
        if (imgRatio < 1) {
          el.style.width = '100%';
          el.style.height = 'auto';
        } else {
          if (imgRatio >= wrapperRatio) {
            el.style.width = 'auto';
            el.style.height = '100%';
          } else {
            el.style.width = '100%';
            el.style.height = 'auto';
          }
        }
      } else {
        if (imgRatio >= 1) {
          el.style.width = 'auto';
          el.style.height = '100%';
        } else {
          if (imgRatio < wrapperRatio) {
            el.style.width = '100%';
            el.style.height = 'auto';
          } else {
            el.style.width = 'auto';
            el.style.height = '100%';
          }
        }
      }
    }

    // Run on mount
    imageCover();

    // Optionally, re-run on window resize
    window.addEventListener('resize', imageCover);

    // Clean up
    el._imageCoverCleanup = () => {
      window.removeEventListener('resize', imageCover);
    };
  },
  unmounted(el) {
    if (el._imageCoverCleanup) el._imageCoverCleanup();
  }
}