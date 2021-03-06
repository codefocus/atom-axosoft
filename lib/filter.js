'use babel';

import AxosoftDomElement from './axosoft-dom-element';
import { Emitter } from 'event-kit';

export default class Filter extends AxosoftDomElement {
    constructor(name, reloadCallback, onDidChangeSelection) {
        super();
        this.name = name;
        this.placeholderText = 'Select a ' + this.name.toLowerCase();
        this.placeholderTextEmpty = 'No ' + this.name.toLowerCase() + 's';
        this.isEmpty = null;
        this.isLoading = null;
        this.reloadCallback = reloadCallback;
        this.onDidChangeSelectionCallback = onDidChangeSelection;
        this.emitter = new Emitter;
        this.reloadElement = this.createReloadElement();
        this.placeholderElement = this.createPlaceholderElement();
        this.dropdownElement = this.createDropdownElement();
        this.containerElement = this.createContainerElement();
        this.setIsLoading(false);
        this.setIsEmpty(true);
    }

    addOption(name, value) {
        let optionElement = this.createElement('option');
        optionElement.value = value;
        optionElement.textContent = name;
        this.dropdownElement.appendChild(optionElement);
        this.setIsLoading(false);
        this.setIsEmpty(false);
    }

    setIsLoading(isLoading) {
        if (this.isLoading == isLoading) {
            return;
        }
        this.isLoading = isLoading;
        if (this.isLoading) {
            if (this.containerElement) {
                this.addClass(this.containerElement, 'reloading');
            }
        } else {
            if (this.containerElement) {
                this.removeClass(this.containerElement, 'reloading');
            }
        }
    }

    setIsEmpty(isEmpty) {
        if (this.isEmpty == isEmpty) {
            return;
        }
        this.isEmpty = isEmpty;
        if (this.isEmpty) {
            if (this.dropdownElement) {
                this.dropdownElement.disabled = true;
            }
            this.setPlaceholderText(this.placeholderTextEmpty);
        } else {
            if (this.dropdownElement) {
                this.dropdownElement.disabled = false;
            }
            this.setPlaceholderText(this.placeholderText);
        }
    }

    select(value) {
        this.dropdownElement.value = value;
    }

    /**
     *  Create container element, wrapping the dropdown.
     *
     *  @return HTMLElement
     */
    createContainerElement() {
        let labelElement = this.createElement('label', 'control-label');
        labelElement.textContent = this.name;
        let containerElement = this.createElement(
            'div',
            ['_filter', 'settings-view', 'control-group'],
            [
                this.createElement(
                    'div',
                    'controls',
                    [
                        this.reloadElement,
                        labelElement,
                        this.dropdownElement,
                    ]
                )
            ]
        );

        return containerElement;
    }

    /**
     *  Create dropdown element.
     *
     *  @return HTMLElement
     */
    createDropdownElement() {
        let element = this.createElement(
            'select',
            'form-control',
            [this.placeholderElement]
        );
        element.addEventListener('change', (event) => {
            event.preventDefault();
            this.didChangeSelection(element.value);
        });

        return element;
    }

    /**
     *  Create reload element.
     *
     *  @return HTMLElement
     */
    createReloadElement() {
        let element = this.createElement('a', '_reload');
        element.addEventListener('click', (event) => {
            event.preventDefault();
            this.requestReload();
        });

        return element;
    }

    requestReload() {
        this.setIsLoading(true);
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
        this.setIsEmpty(true);
        if (this.dropdownElement) {
            this.dropdownElement.innerHTML = '';
        }
        this.setPlaceholderText(this.placeholderTextEmpty);
    }

    /**
     *  Create a placeholder <option> element.
     *
     *  @param string text
     *
     *  @return HTMLElement
     */
    createPlaceholderElement(text) {
        text = text || this.placeholderTextEmpty;
        this.placeholderElement = this.createElement('option', '_placeholder');
        this.placeholderElement.disabled = true;
        this.placeholderElement.selected = true;
        this.placeholderElement.textContent = text;

        return this.placeholderElement;
    }

    /**
     *  Set placeholder text.
     *
     *  @param string text
     */
    setPlaceholderText(text) {
        text = text || this.placeholderText;
        if (!this.placeholderElement) {
            this.placeholderElement = createPlaceholderElement(text);
        } else {
            this.placeholderElement.textContent = text;
        }
        if (this.dropdownElement) {
            if (!this.dropdownElement.contains(this.placeholderElement)) {
                this.dropdownElement.appendChild(this.placeholderElement);
            }
        }
    }
}
