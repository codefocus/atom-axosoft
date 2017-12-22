'use babel';

import { Emitter } from 'event-kit';

export default class Filter {
    constructor(name, reloadCallback, onDidChangeSelection) {
        this.name = name;
        this.reloadCallback = reloadCallback;
        this.onDidChangeSelectionCallback = onDidChangeSelection;

        this.emitter = new Emitter;
        this.reloadElement = this.createReloadElement();
        this.dropdownElement = this.createDropdownElement();
        this.containerElement = this.createContainerElement();

        this.reset();
    }

    addOption(name, value) {
        let optionElement = document.createElement('option');
        optionElement.value = value;
        optionElement.textContent = name;
        this.dropdownElement.appendChild(optionElement);
        this.removeClass(this.containerElement, 'reloading');
    }

    /**
     *  Create container element, wrapping the dropdown.
     *
     *  @return HTMLElement
     */
    createContainerElement() {
        let containerElement = document.createElement('div');
        let controlsElement = document.createElement('div');
        let labelElement = document.createElement('label');
        this.addClass(containerElement, 'filter');
        this.addClass(containerElement, 'control-group', false);
        this.addClass(controlsElement, 'controls', false);
        this.addClass(labelElement, 'control-label', false);
        labelElement.textContent = this.name;
        controlsElement.appendChild(this.reloadElement);
        controlsElement.appendChild(labelElement);
        controlsElement.appendChild(this.dropdownElement);
        containerElement.appendChild(controlsElement);

        return containerElement;
    }

    /**
     *  Create dropdown element.
     *
     *  @return HTMLElement
     */
    createDropdownElement() {
        let element = document.createElement('select');
        this.addClass(element, 'form-control', false);
        element.addEventListener('change', (event) => {
            event.preventDefault();
            this.didChangeSelection(element.value);
        });

        return element;
    }

    createReloadElement() {
        let element = document.createElement('a');
        this.addClass(element, 'reload');
        element.addEventListener('click', (event) => {
            event.preventDefault();
            this.requestReload();
        });

        return element;
    }

    requestReload() {
        this.addClass(this.containerElement, 'reloading');
        this.reset();
        this.reloadCallback();
    }

    didChangeSelection(value) {
        console.log('didChangeSelection');
        console.log(value);
        this.onDidChangeSelectionCallback(value);
    }

    /**
     *  Reset dropdown, and add a placeholder option.
     */
    reset() {
        let optionElement = document.createElement('option');
        optionElement.disabled = true;
        optionElement.selected = true;
        optionElement.textContent = 'Select a ' + this.name.toLowerCase();
        this.addClass(optionElement, 'placeholder');
        this.dropdownElement.innerHTML = '';
        this.dropdownElement.appendChild(optionElement);
    }

    prefixClass(className) {
        return 'atom-axosoft-' + className;
    }

    addClass(element, className, isPrefixed = true) {
        element.classList.add(
            isPrefixed ? this.prefixClass(className) : className
        );
    }

    removeClass(element, className) {
        element.classList.remove(
            this.prefixClass(className)
        );
    }
}
