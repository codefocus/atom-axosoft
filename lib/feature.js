'use babel';

import AxosoftDomElement from './axosoft-dom-element';
import { Emitter } from 'event-kit';
const animate = require('amator');

export default class Feature extends AxosoftDomElement {
    constructor(options) {
        super();

        if (!options.feature) {
            throw 'No Axosoft feature provided.';
        }
        if (!options.ulElement) {
            throw 'No UL element provided.';
        }
        this.isDisabled = false;
        this.isFiltered = false;
        this.feature = options.feature;
        this.children = [];
        this.elements = {
            ul: options.ulElement,
            childrenList: null,
            id: null,
            name: null,
            description: null,
            li: null,
            status: null
        };
        this.onDidRequestWorkflowStepSelection = options.onDidRequestWorkflowStepSelection || null;

        this.element = this.createFeatureElements(this.feature);

        // if (this.feature.parent && this.feature.parent.id) {
        //     this.element.style.opacity = .3;
        // }
    }

    /**
     *  Create feature elements.
     *
     *  @param object feature
     *
     *  @return HTMLElement
     */
    createFeatureElements(feature) {
        this.elements.id = this._el('a', '_feature-id');
        this.elements.name = this._el('span', '_feature-name');
        this.elements.status = this._el('span', '_feature-status');
        this.elements.description = this._el('div');
        this.elements.description.innerHTML = (feature.description)
            ? this.simplifyHTML(feature.description)
            : '(No description)';
        this.elements.li = this._el(
            'li',
            '_feature-priority-' + feature.priority.name.toLowerCase(),
            [
                this._el(
                    'div',
                    '_feature-line',
                    [
                        this._el('span', '_feature-favourite'),
                        this.elements.id,
                        this.elements.name,
                        this.elements.status,
                        this._el('span', '_feature-priority'),
                    ]
                ),
                this._el(
                    'div',
                    (feature.description)
                        ? '_feature-description'
                        : ['_feature-description', '_empty'],
                    [
                        this.elements.description
                    ]
                ),
            ]
        );
        this.elements.li.dataset.id = feature.id;
        this.elements.id.href = atom.config.get('atom-axosoft.axosoftUrl') +
            '/viewitem' +
            '?id=' + feature.id +
            '&type=' + feature.type +
            '&force_use_number=true';
        this.elements.id.title = 'Open in axosoft';
        this.elements.id.textContent = feature.id;
        this.elements.name.textContent = feature.name || '(No name)';
        this.elements.status.textContent = feature.workflow_step.name;
        this._onClick(
            this.elements.status,
            this.onStatusClick.bind(this)
        );
        this._onClick(
            this.elements.li,
            this.onClick.bind(this)
        );

        return this.elements.li;
    }

    onClick(event) {
        event.preventDefault();
        if (this.isDisabled) {
            return;
        }
        for (let i = 0; i < event.path.length; ++i) {
            //  Clicking the id link should not
            //  trigger the description to open.
            if (event.path[i] == this.elements.id) {
                return;
            }
            //  Clicking the description should not
            //  trigger the description to close.
            if (event.path[i] == this.elements.description) {
                return;
            }
            if (event.path[i] == this.elements.li) {
                break;
            }
        }
        let isOpen = this.elements.li.classList.contains(
            this.prefixClass('open')
        );
        this.elements.ul
            .querySelectorAll('li')
            .forEach(element => {
                this.removeClass(element, 'open')
            });
        if ( ! isOpen) {
            this.addClass(this.elements.li, 'open');
            //  Scroll into view if needed.
            let newElementBottom = this.elements.li.offsetTop + this.elements.li.offsetHeight + Math.min(
                this.elements.description.scrollHeight,
                parseFloat(getComputedStyle(this.elements.description).fontSize) * 20
            );
            let visibleBottom = this.elements.ul.offsetHeight + this.elements.ul.scrollTop;
            if (newElementBottom > visibleBottom) {
                animate(
                  this.elements.ul,
                  {
                    scrollTop: (
                        this.elements.ul.scrollTop + (newElementBottom - visibleBottom)
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

    onStatusClick(event) {
        event.preventDefault();
        if (this.isDisabled) {
            return;
        }
        if (this.onDidRequestWorkflowStepSelection) {
            this.onDidRequestWorkflowStepSelection(
                this
            );
        }
    }

    get featureName() {
        return this.feature.name;
    }

    set filtered(isFiltered) {
        if (isFiltered == this.isFiltered) {
            return;
        }
        this.isFiltered = isFiltered;
        if (this.isFiltered) {
            this.addClass(this.elements.li, 'hidden', false);
        } else {
            this.removeClass(this.elements.li, 'hidden', false);
        }
    }

    get filtered() {
        return this.isFiltered;
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
        this.elements.status.textContent = workflowStep.name;
    }

    set disabled(isDisabled) {
        this.isDisabled = isDisabled;
        if (this.isDisabled) {
            this.addClass(this.elements.li, 'disabled', true);
        } else {
            this.removeClass(this.elements.li, 'disabled', true);
        }

    }

    get disabled() {
        return this.isDisabled;
    }

    addChild(feature) {
        if (this.elements.childrenList == null) {
            this.elements.childrenList = this._el(
                'ul',
                [
                    '_feature-children',
                    '_feature-list',
                ]
            );
            this.elements.li.appendChild(this.elements.childrenList);
        }
        this.children.push(feature);
        this.elements.childrenList.appendChild(feature.element);
    }
}
