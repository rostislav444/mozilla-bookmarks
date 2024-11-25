function shadeHexColor(color, percent) {
    color = color.replace('#', '');


    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    let RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    let GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    let BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

function shadeHslColor(hslStr, percent) {
    // Извлекаем значения HSL из строки формата "hsl(360, 100%, 100%)"
    const matches = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);

    if (!matches) {
        throw new Error('Неверный формат HSL. Ожидается: hsl(360, 100%, 100%)');
    }

    let h = parseInt(matches[1]); // Hue
    let s = parseInt(matches[2]); // Saturation
    let l = parseInt(matches[3]); // Lightness

    // Изменяем только светлость
    l = Math.min(100, Math.max(0, l + percent));

    // Возвращаем новый HSL цвет
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function shadeRGBColor(rgbStr, percent) {
    // Извлекаем значения RGB из строки формата "rgb(255, 255, 255)"
    const matches = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    if (!matches) {
        throw new Error('Неверный формат RGB. Ожидается: rgb(255, 255, 255)');
    }

    // Получаем значения RGB
    let r = parseInt(matches[1]);
    let g = parseInt(matches[2]);
    let b = parseInt(matches[3]);

    // Изменяем значения на указанный процент
    r = Math.min(255, Math.max(0, Math.round(r * (100 + percent) / 100)));
    g = Math.min(255, Math.max(0, Math.round(g * (100 + percent) / 100)));
    b = Math.min(255, Math.max(0, Math.round(b * (100 + percent) / 100)));

    // Возвращаем новый RGB цвет
    return `rgb(${r}, ${g}, ${b})`;
}

export function shadeColor(color, percent) {
    if (color.startsWith('#')) {
        return shadeHexColor(color, percent);
    } else if (color.startsWith('hsl')) {
        return shadeHslColor(color, percent);
    } else if (color.startsWith('rgb')) {
        return shadeRGBColor(color, percent);
    }

    return color
}