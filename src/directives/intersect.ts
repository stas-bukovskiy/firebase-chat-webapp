
const intersectDirective = {
    created: (el, binding) => intersectDirectiveFunc(el, binding),
    updated: (el, binding) => intersectDirectiveFunc(el, binding),
};

const intersectDirectiveFunc = (el, binding) => {
    const options = binding.value.options || { root: null, threshold: 0.5 };
    const observer = new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {
            binding.value.callback();
            observer.unobserve(el);
        }
    }, options);
    observer.observe(el);
}

export const install = (app) => {
    app.directive('intersect', intersectDirective);
}