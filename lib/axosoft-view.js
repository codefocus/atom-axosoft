'use babel';

import { Emitter } from 'event-kit';
import Filter from './filter';
const animate = require('amator');
import * as linkify from 'linkifyjs';
import linkifyHtml from 'linkifyjs/html';


export default class AxosoftView {
    /**
     *  Constructor
     *
     *  @param object serializedState
     */
    constructor(serializedState) {
        this.emitter = new Emitter;
        //  Create root element.
        this.element = document.createElement('div');
        this.element.classList.add('atom-axosoft');
        //  Create "Filter" filter.
        this.filterFilter = new Filter('Filter', () => {
            this.emitter.emit('did-request-filters');
        }, (filter_id) => {
            this.resetFeatures();
            this.emitter.emit('did-select-filter', filter_id);
        });
        //  Create "Project" filter.
        this.projectFilter = new Filter('Project', () => {
            this.emitter.emit('did-request-projects');
        }, (project_id) => {
            this.resetFeatures();
            this.emitter.emit('did-select-project', project_id);
        });
        //  Create list to contain Axosoft items.
        this.ulElement = document.createElement('ul');
        this.addClass(this.ulElement, 'feature-list');

        this.element.appendChild(this.filterFilter.containerElement);
        this.element.appendChild(this.projectFilter.containerElement);
        this.element.appendChild(this.ulElement);
    }

    onDidRequestProjects(callback) {
        return this.emitter.on('did-request-projects', () => {
            console.log('onDidRequestProjects fired');
            callback();
        });
    }

    onDidSelectProject(callback) {
        return this.emitter.on('did-select-project', (project) => {
            console.log('onDidSelectProject fired');
            callback(project);
        });
    }

    onDidRequestFilters(callback) {
        return this.emitter.on('did-request-filters', () => {
            console.log('onDidRequestFilters fired');
            callback();
        });
    }

    onDidSelectFilter(callback) {
        return this.emitter.on('did-select-filter', (filter) => {
            console.log('onDidSelectFilter fired');
            callback(filter);
        });
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
        this.emitter.dispose();
    }

    getElement() {
        return this.element;
    }

    getTitle() {
        return 'Axosoft';
    }

    getURI() {
        return 'atom://axosoft';
    }

    getDefaultLocation(){
        return 'right';
    }


    getAllowedLocations() {
        return ['right', 'left'];
    }

    resetFeatures() {
        this.ulElement.innerHTML = 'Loading...';
    }


    setFeatures(features) {
        this.ulElement.innerHTML = '';
        let i;
        let j;
        for (i = 0; i < features.length; ++i) {
            this.ulElement.appendChild(
                this.createFeatureElement(features[i])
            );
        }
    }

    setProjects(projects) {
        projects.forEach((project) => {
            this.projectFilter.addOption(
                project.name,
                project.id
            )
        });
    }

    setFilters(filters) {
        filters.forEach((filter) => {
            this.filterFilter.addOption(
                filter.name,
                filter.id
            )
        });
    }

    createFeatureElement(feature) {
        let liElement = document.createElement('li');
        let idElement = document.createElement('a');
        let nameElement = document.createElement('span');
        let statusElement = document.createElement('span');
        let priorityElement = document.createElement('span');
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
        this.addClass(descriptionElement, 'feature-description');

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

        if (feature.description) {
            descriptionElement.innerHTML = this.simplifyHTML(feature.description);
        } else {
            this.addClass(descriptionElement, 'empty');
            descriptionElement.innerHTML = '(No description)';
        }

        liElement.appendChild(idElement);
        liElement.appendChild(nameElement);
        liElement.appendChild(statusElement);
        liElement.appendChild(priorityElement);
        liElement.appendChild(descriptionElement);
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

    simplifyHTML(html) {
        if ( ! html) {
            return '';
        }
        let preserveTags = [
            'p',
            'strong', 'b',
            'em', 'i',
            'pre', 'code',
            'u',
            'a',
            'br'
        ];
        let preserveAttributes = [
            'a',
            'img'
        ];
        let element;
        if (typeof html == 'string') {
            element = document.createElement('div');
            element.innerHTML = html;
            if ( ! element.childElementCount) {
                return linkifyHtml(
                    html.replace(/[\s\r\n]+/, ' ')
                );
            }
        } else {
            element = html;
            if ( ! element.hasChildNodes()) {
                return linkifyHtml(
                    element.textContent.replace(/[\s\r\n]+/, ' ')
                );
            }
        }
        let brCount = 0;
        let simplifiedHTML = '';
        for (let i = 0; i < element.childNodes.length; ++i) {
            let childNode = element.childNodes[i];
            let childHTML = this.simplifyHTML(childNode);
            let childTag = childNode.nodeName.toLowerCase();

            if (preserveTags.includes(childTag)) {
                if (childTag == 'br') {
                     if (++brCount > 2) {
                         continue;
                     }
                } else {
                     brCount = 0;
                }
                simplifiedHTML += '<' + childTag
                if (preserveAttributes.includes(childTag)) {
                    for (let j = 0; j < childNode.attributes.length; ++j) {
                        let attribute = childNode.attributes.item(j);
                        simplifiedHTML += ' ' + attribute.name + '="' + attribute.value + '"';
                    }
                }
                simplifiedHTML += '>';
                simplifiedHTML += childHTML;
                simplifiedHTML += '</' + childTag + '>';
            } else {
                simplifiedHTML += childHTML;
            }
        }

        return simplifiedHTML
            .replace(/[\s\r\n]+/, ' ');
    }

    prefixClass(className) {
        return 'atom-axosoft-' + className;
    }

    addClass(element, className, isUnprefixed) {
        element.classList.add(
            isUnprefixed ? className : this.prefixClass(className)
        );
    }
    removeClass(element, className) {
        element.classList.remove(
            this.prefixClass(className)
        );
    }

}
