
document.addEventListener("wheel", function (event) {
    const activeElement = document.activeElement;

    if (
        activeElement &&
        activeElement.matches('input[type="number"]')
    ) {
        activeElement.blur();
    }
}, { passive: true });
