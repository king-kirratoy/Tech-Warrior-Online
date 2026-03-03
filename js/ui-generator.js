// ui-generator.js

/**
 * Dynamically generates UI buttons for chassis, weapons, modifications, and colors.
 */

function generateUIButton(name, type) {
    const button = document.createElement('button');
    button.innerText = name;
    button.className = `btn ${type}`;
    return button;
}

function generateUI() {
    const uiContainer = document.getElementById('ui-container');

    const chassisButtons = ['Chassis1', 'Chassis2', 'Chassis3'];
    const weaponButtons = ['Weapon1', 'Weapon2', 'Weapon3'];
    const modificationButtons = ['Modification1', 'Modification2'];
    const colorButtons = ['Red', 'Blue', 'Green'];

    chassisButtons.forEach(chassis => {
        uiContainer.appendChild(generateUIButton(chassis, 'chassis'));
    });

    weaponButtons.forEach(weapon => {
        uiContainer.appendChild(generateUIButton(weapon, 'weapon'));
    });

    modificationButtons.forEach(mod => {
        uiContainer.appendChild(generateUIButton(mod, 'modification'));
    });

    colorButtons.forEach(color => {
        uiContainer.appendChild(generateUIButton(color, 'color'));
    });
}

document.addEventListener('DOMContentLoaded', generateUI);
