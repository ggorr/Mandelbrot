import { centerTo, expand, display } from './mandel.js';
let div = document.createElement('div');
function createContextmenu() {
    let menus = [
        ['cm-center', 'translate to center', 0],
        ['cm-expand-1/4', 'expand 1/4 at center', 0.25],
        ['cm-expand-1/2', 'expand 1/2 at center', 0.5],
        ['cm-expand-2', 'expand 2 at center', 2],
        ['cm-expand-4', 'expand 4 at center', 4]
    ];
    div.id = 'contextmenu';
    menus.forEach(([id, text, v]) => {
        let target = document.createElement('div');
        target.id = id;
        target.className = 'menu';
        target.appendChild(document.createTextNode(text));
        target.addEventListener('mouseover', () => {
            target.style.backgroundColor = '#BBB';
        });
        target.addEventListener('mouseout', () => {
            target.style.backgroundColor = '#CCC';
        });
        div.appendChild(target);
        if (v > 0)
            target.addEventListener('click', () => {
                hideContextmenu();
                expand(v);
                display();
            });
    });
    document.body.appendChild(div);
}
let listener = null;
function showContextmenu(pageX, pageY, canvasX, canvasY) {
    div.style.display = 'block';
    div.style.left = pageX + 'px';
    div.style.top = pageY + 'px';
    let menu = document.getElementById('cm-center');
    if (listener != null)
        menu === null || menu === void 0 ? void 0 : menu.removeEventListener('click', listener);
    listener = () => {
        hideContextmenu();
        centerTo(canvasX, canvasY);
        display();
    };
    menu === null || menu === void 0 ? void 0 : menu.addEventListener('click', listener);
}
function hideContextmenu() {
    div.style.display = 'none';
}
export { createContextmenu, showContextmenu, hideContextmenu };
