'use babel';

import AxosoftDomElement from './axosoft-dom-element';
import { Emitter } from 'event-kit';

export default class Feature extends AxosoftDomElement {
    constructor(options) {
        super();

        if (!options.feature) {
            throw 'No Axosoft feature provided.';
        }
        if (!options.ulElement) {
            throw 'No UL element provided.';
        }
        this.feature = options.feature;
        this.ulElement = options.ulElement;
        this.onDidRequestWorkflowStepSelection = options.onDidRequestWorkflowStepSelection || null;


        this.element = this.createElement(this.feature);


        // this.emitter = new Emitter;

        // this.name = name;
        // this.reloadCallback = reloadCallback;
        // this.onDidChangeSelectionCallback = onDidChangeSelection;
        //
        // this.emitter = new Emitter;
        // this.reloadElement = this.createReloadElement();
        // this.placeholderElement = this.createPlaceholderElement();
        // this.dropdownElement = this.createDropdownElement();
        //
        //
        // this.containerElement = this.createContainerElement();

        // this.reset();
    }

    createElement(feature) {
        let liElement = document.createElement('li');
        let idElement = document.createElement('a');
        let nameElement = document.createElement('span');
        let statusElement = document.createElement('span');
        let priorityElement = document.createElement('span');
        let descriptionContainerElement = document.createElement('div');
        let descriptionElement = document.createElement('div');

        this.addClass(idElement, 'feature-id');
        this.addClass(nameElement, 'feature-name');
        this.addClass(statusElement, 'feature-status');
        this.addClass(priorityElement, 'feature-priority');
        switch(feature.priority.name) {
            case 'High':
                this.addClass(liElement, 'feature-priority-high');
                break;
            case 'Medium':
                this.addClass(liElement, 'feature-priority-medium');
                break;
            case 'Low':
                this.addClass(liElement, 'feature-priority-low');
                break;
        }
        this.addClass(descriptionContainerElement, 'feature-description');

        liElement.dataset.id = feature.id;
        idElement.href = atom.config.get('atom-axosoft.axosoftUrl') +
            '/viewitem' +
            '?id=' + feature.id +
            '&type=' + feature.type +
            '&force_use_number=true';
        idElement.title = 'Open in axosoft';
        idElement.textContent = feature.id;
        nameElement.textContent = feature.name || '(No name)';
        statusElement.textContent = feature.workflow_step.name;
        statusElement.addEventListener(
            'click',
            (event) => {
                if (this.onDidRequestWorkflowStepSelection) {
                    this.onDidRequestWorkflowStepSelection(
                        this
                    );
                }
                // this.emitter.emit(
                //     'did-request-workflow-step-selection'
                // );
                // console.log('new AxosoftWorkflowStepSelector');
                // let a = new AxosoftWorkflowStepSelector();
                // a.initialize();
            }
        );
        // statusElement.appendChild(
        //     this.createDropdownElement()
        // );

        if (feature.description) {
            descriptionElement.innerHTML = this.simplifyHTML(feature.description);
        } else {
            this.addClass(descriptionContainerElement, 'empty');
            descriptionElement.innerHTML = '(No description)';
        }

        liElement.appendChild(idElement);
        liElement.appendChild(nameElement);
        liElement.appendChild(statusElement);
        liElement.appendChild(priorityElement);
        descriptionContainerElement.appendChild(descriptionElement);
        liElement.appendChild(descriptionContainerElement);
        liElement.addEventListener(
            'click',
            (event) => {
                for (let i = 0; i < event.path.length; ++i) {
                    //  Clicking the id link should not
                    //  trigger the description to open.
                    if (event.path[i] == idElement) {
                        return;
                    }
                    //  Clicking the description should not
                    //  trigger the description to close.
                    if (event.path[i] == descriptionElement) {
                        return;
                    }
                    if (event.path[i] == liElement) {
                        break;
                    }
                }
                let isOpen = liElement.classList.contains(
                    this.prefixClass('open')
                );
                liElement.parentElement
                    .querySelectorAll('li')
                    .forEach(element => {
                        this.removeClass(element, 'open')
                    });
                if ( ! isOpen) {
                    this.addClass(liElement, 'open');

                    //  Scroll into view if needed.
                    let newElementBottom = liElement.offsetTop + liElement.offsetHeight + Math.min(
                        descriptionElement.scrollHeight,
                        parseFloat(getComputedStyle(descriptionElement).fontSize) * 20
                    );
                    let visibleBottom = this.ulElement.offsetHeight + this.ulElement.scrollTop;
                    if (newElementBottom > visibleBottom) {
                        animate(
                          this.ulElement,
                          {
                            scrollTop: (
                                this.ulElement.scrollTop + (newElementBottom - visibleBottom)
                            ),
                          },
                          {
                              duration: 150,
                              easing: 'easeIn'
                          }
                        )
                    }
                }
            }
        );

        return liElement;
    }

    // /**
    //  *  Create dropdown element.
    //  *
    //  *  @return HTMLElement
    //  */
    // createDropdownElement() {
    //     let element = document.createElement('select');
    //     this.addClass(element, 'form-control', false);
    //     // element.addEventListener('change', (event) => {
    //     //     event.preventDefault();
    //     //     this.didChangeSelection(element.value);
    //     // });
    //     element.appendChild(
    //         this.createPlaceholderElement('some text')
    //     );
    //
    //     return element;
    // }

    /**
     *  Create a placeholder <option> element.
     *
     *  @param string text
     *
     *  @return HTMLElement
     */
    createPlaceholderElement(text) {

        text = text || this.placeholderTextEmpty;
        let element = document.createElement('option');
        element.disabled = true;
        element.selected = true;
        element.textContent = text;
        this.addClass(element, 'placeholder');

        return element;
    }

    get workflowStep() {
        return this.feature.workflow_step;
    }

    set workflowStep(workflowStep) {
        if (!workflowStep.id) {
            throw 'Workflow step requires an id';
        }
        if (!workflowStep.name) {
            throw 'Workflow step requires a name';
        }
        this.feature.workflow_step = workflowStep;
    }
}
