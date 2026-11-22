// Единый счётчик корзины для каталога и корзины.
(function () {
    function updateHeaderCart() {
        let items = [];
        try {
            const parsed = JSON.parse(sessionStorage.getItem("shoplab_cart") || "[]");
            if (Array.isArray(parsed)) items = parsed;
        } catch (error) {
            items = [];
        }
        const count = document.getElementById("cart-count");
        if (count) count.textContent = String(items.length);
    }
    document.addEventListener("DOMContentLoaded", updateHeaderCart);
    window.addEventListener("pageshow", updateHeaderCart);
})();
