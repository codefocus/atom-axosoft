'use babel';

import { Emitter } from 'event-kit';
import Feature from './feature';
import Filter from './filter';
const animate = require('amator');



export default class AxosoftView {
    /**
     *  Constructor
     *
     *  @param object serializedState
     */
    constructor(serializedState) {
        // super();
        this.filters = [];
        this.projects = [];
        this.selectedFilterId = null;
        this.selectedProjectId = null;

        this.emitter = new Emitter;
        //  Create root element.
        this.element = document.createElement('div');
        this.element.classList.add('atom-axosoft');
        //  Create "Filter" filter.
        this.filterFilter = new Filter('Filter', () => {
            this.emitter.emit('did-request-filters');
        }, (filter_id) => {
            this.resetFeatures();
            this.selectedFilterId = filter_id;
            this.emitter.emit('did-select-filter', filter_id);
        });
        //  Create "Project" filter.
        this.projectFilter = new Filter('Project', () => {
            this.emitter.emit('did-request-projects');
        }, (project_id) => {
            this.resetFeatures();
            this.selectedProjectId = project_id;
            this.emitter.emit('did-select-project', project_id);
        });
        //  Create message container.
        this.messageElement = document.createElement('div');
        this.addClass(this.messageElement, 'message');
        //  Create list to contain Axosoft items.
        this.ulElement = document.createElement('ul');
        this.addClass(this.ulElement, 'feature-list');
        this.element.appendChild(this.filterFilter.containerElement);
        this.element.appendChild(this.projectFilter.containerElement);
        this.element.appendChild(this.messageElement);
        this.element.appendChild(this.ulElement);

        if (serializedState) {
            if (serializedState.filters) {
                this.setFilters(serializedState.filters);
            }
            if (serializedState.selectedFilterId) {
                this.filterFilter.select(serializedState.selectedFilterId);
            }
            if (serializedState.projects) {
                this.setProjects(serializedState.projects);
            }
            if (serializedState.selectedProjectId) {
                this.projectFilter.select(serializedState.selectedProjectId);
            }
            if (serializedState.features) {
                this.setFeatures(serializedState.features);
            }
        }
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
    serialize() {
        return {
            filters: this.filters,
            projects: this.projects,
            features: this.features,
            selectedFilterId: this.selectedFilterId,
            selectedProjectId: this.selectedProjectId
        };
    }

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

    reset() {
        this.resetFeatures();
        this.filterFilter.reset();
        this.projectFilter.reset();
    }

    resetFeatures() {
        this.ulElement.innerHTML = '';
        this.setMessage('Loading...', 'loading');
    }

    resetMessage() {
        this.setMessage('');
    }

    setMessage(message, messageType) {
        this.messageElement.className = 'atom-axosoft-message';
        this.messageElement.innerHTML = message;
        if (messageType) {
            this.addClass(this.messageElement, messageType, true);
        }
    }


    setFeatures(features) {
        this.resetFeatures();
        this.features = features;
        this.resetMessage();
        console.log(this.features);
        for (let i = 0; i < this.features.length; ++i) {
            let feature = new Feature(this.features[i]);
            // console.log(feature);
            this.ulElement.appendChild(
                feature.element
            );
        }

    }

    setProjects(projects) {
        this.projects = projects;
        this.projects.forEach((project) => {
            this.projectFilter.addOption(
                project.name,
                project.id
            )
        });
    }

    setFilters(filters) {
        this.filters = filters;
        this.filters.forEach((filter) => {
            this.filterFilter.addOption(
                filter.name,
                filter.id
            )
        });
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

};
