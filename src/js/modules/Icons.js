export const icons = (() => {
    const get = (name) => document.createRange().createContextualFragment(`<svg class="icon" ><use href="${name}"></use></svg>`);
    return { get, };
  })();
export default icons;