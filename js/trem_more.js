function link(url) {
    window.open(`https://${url}`, "_blank");
}

const formulaContainer = document.querySelector('.formula ul');

const levels = [
    { label: '0級：', condition: 'X < 0' },
    { label: '1~4級：', condition: 'X < 4.5 (X四捨五入)' },
    { label: '5弱：', condition: 'X < 5' },
    { label: '5強：', condition: 'X < 5.5' },
    { label: '6弱：', condition: 'X < 6' },
    { label: '6強：', condition: 'X < 6.5' },
    { label: '7級：', condition: '若上述條件都不成立' }
];

levels.forEach(function (level) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = level.label;
    li.appendChild(span);
    li.innerHTML += level.condition;
    formulaContainer.appendChild(li);
});

const intList = document.getElementById("int_list");

const intensityLevels = [
    { level: "1級" },
    { level: "2級" },
    { level: "3級" },
    { level: "4級" },
    { level: "5弱" },
    { level: "5強" },
    { level: "6弱" },
    { level: "6強" },
    { level: "7級" }
];

for (var i = 0; i < intensityLevels.length; i++) {
    const text = document.createElement("text");
    text.textContent = intensityLevels[i].level;
    intList.appendChild(text);

    if (i < intensityLevels.length - 1) {
        const separator = document.createTextNode("、");
        intList.appendChild(separator);
    }
}