'use babel';

import { Emitter } from 'event-kit';
import Filter from './filter';
const animate = require('amator')

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

        // //  Create project filter container.
        // let projectFilterElement = document.createElement('div');
        // this.addClass(projectFilterElement, 'project-filter');
        // //  Create fuzzy project dropdown.
        // this.projectSelectList = new SelectList({
        //     items: [],
        //     emptyMessage: 'No projects to display.',
        //     didChangeQuery: (query) => {
        //         if (query) {
        //             this.projectSelectList.element.classList.add('active');
        //         } else {
        //             this.projectSelectList.element.classList.remove('active');
        //         }
        //     },
        //     didCancelSelection: () => {
        //         this.projectSelectList.reset();
        //     },
        //     elementForItem: (item, options) => {
        //         let element = document.createElement('div');
        //         element.innerHTML = item.name;
        //         return element;
        //     },
        //     filterKeyForItem: (item) => {
        //         return item.name;
        //     },
        //     didConfirmSelection: (item) => {
        //         this.emitter.emit('did-select-project', item);
        //         this.projectSelectList.reset();
        //         this.projectSelectList.element.dataset.projectName = item.name;
        //         this.projectSelectList.element.classList.remove('empty');
        //         this.projectSelectList.element.blur();
        //         this.ulElement.focus();
        //     },
        //     didConfirmEmptySelection: () => {
        //         this.projectSelectList.reset();
        //         this.projectSelectList.element.classList.add('empty');
        //     }
        // });
        // this.projectSelectList.element.classList.add('empty');
        // //  Create project dropdown.
        // if (this.projectSelectList.refs.queryEditor.element) {
        //     this.projectSelectList.refs.queryEditor.element.addEventListener(
        //         'focus',
        //         () => {
        //             this.projectSelectList.element.classList.add('focus');
        //         }
        //     );
        //     this.projectSelectList.refs.queryEditor.element.addEventListener(
        //         'blur',
        //         () => {
        //             this.projectSelectList.element.classList.remove('focus');
        //         }
        //     );
        // }
        // projectFilterElement.appendChild(this.projectSelectList.element);
        // //  Create button to reload projects.
        // let reloadProjectsElement = document.createElement('a');
        // this.addClass(reloadProjectsElement, 'reload-projects');
        // reloadProjectsElement.title = 'Reload Axosoft projects';
        // reloadProjectsElement.addEventListener(
        //     'click',
        //     () => {
        //         this.emitter.emit('did-request-projects');
        //     }
        // );
        // projectFilterElement.appendChild(reloadProjectsElement);
        //  Create list to contain Axosoft items.
        this.ulElement = document.createElement('ul');
        this.addClass(this.ulElement, 'feature-list');

        this.element.appendChild(this.filterFilter.containerElement);
        this.element.appendChild(this.projectFilter.containerElement);
        // this.element.appendChild(projectFilterElement);
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
            descriptionElement.innerHTML = feature.description;
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
            () => {
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
