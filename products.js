const SHOPLAB_PRODUCTS = [
    {
        id: "A",
        brand: "Averon",
        name: "Averon H20",
        basePrice: 4990,
        battery: "20 часов",
        weight: "220 г",
        noise: "Нет",
        warranty: "12 месяцев",
        bluetooth: "5.0",
        charging: "USB-C",
        microphone: "Есть",
        foldable: "Нет",
        range: "10 м",
        colors: "2",
        water: "Нет",
        controls: "Кнопки"
    },
    {
        id: "B",
        brand: "Belmar",
        name: "Belmar H30",
        basePrice: 5990,
        battery: "30 часов",
        weight: "240 г",
        noise: "Есть",
        warranty: "12 месяцев",
        bluetooth: "5.2",
        charging: "USB-C",
        microphone: "Есть",
        foldable: "Есть",
        range: "10 м",
        colors: "3",
        water: "Нет",
        controls: "Кнопки"
    },
    {
        id: "C",
        brand: "Cevian",
        name: "Cevian H40",
        basePrice: 6990,
        battery: "40 часов",
        weight: "260 г",
        noise: "Есть",
        warranty: "24 месяца",
        bluetooth: "5.3",
        charging: "USB-C",
        microphone: "Есть",
        foldable: "Есть",
        range: "15 м",
        colors: "3",
        water: "IPX4",
        controls: "Сенсор"
    },
    {
        id: "D",
        brand: "Deltro",
        name: "Deltro H25",
        basePrice: 5490,
        battery: "25 часов",
        weight: "190 г",
        noise: "Нет",
        warranty: "24 месяца",
        bluetooth: "5.1",
        charging: "USB-C",
        microphone: "Есть",
        foldable: "Есть",
        range: "10 м",
        colors: "4",
        water: "Нет",
        controls: "Кнопки"
    },
    {
        id: "E",
        brand: "Elnor",
        name: "Elnor H45",
        basePrice: 6490,
        battery: "45 часов",
        weight: "280 г",
        noise: "Есть",
        warranty: "12 месяцев",
        bluetooth: "5.3",
        charging: "USB-C",
        microphone: "Есть",
        foldable: "Нет",
        range: "15 м",
        colors: "2",
        water: "IPX4",
        controls: "Кнопки"
    },
    {
        id: "F",
        brand: "Feron",
        name: "Feron H35",
        basePrice: 7490,
        battery: "35 часов",
        weight: "210 г",
        noise: "Есть",
        warranty: "36 месяцев",
        bluetooth: "5.3",
        charging: "USB-C",
        microphone: "Есть",
        foldable: "Есть",
        range: "15 м",
        colors: "4",
        water: "IPX4",
        controls: "Сенсор"
    }
];

const SHOPLAB_ATTRIBUTES = [
    ["Автономность", "battery"],
    ["Вес", "weight"],
    ["Шумоподавление", "noise"],
    ["Гарантия", "warranty"],
    ["Bluetooth", "bluetooth"],
    ["Зарядка", "charging"],
    ["Микрофон", "microphone"],
    ["Складная конструкция", "foldable"],
    ["Радиус действия", "range"],
    ["Количество цветов", "colors"],
    ["Защита от воды", "water"],
    ["Управление", "controls"]
];

const SHOPLAB_ATTRIBUTE_COUNTS = {
    low: 4,
    medium: 8,
    high: 12
};


function getVisibleAttributes(load) {
    return SHOPLAB_ATTRIBUTES.slice(0, SHOPLAB_ATTRIBUTE_COUNTS[load]);
}
