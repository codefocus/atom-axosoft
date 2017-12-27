'use babel';

import { Emitter } from 'event-kit';
import Feature from './feature';
import Filter from './filter';
import AtomAxosoftApi from './atom-axosoft-api';
import AxosoftWorkflowStepSelector from './axosoft-select-workflow-step';
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
        this.workflowSteps = [];
        this.selectedFilterId = null;
        this.selectedProjectId = null;
        this.emitter = new Emitter;
        this.api = new AtomAxosoftApi(this);
        //  Create root element.
        this.element = document.createElement('div');
        this.element.classList.add('atom-axosoft');
        //  Create "Filter" filter.
        this.filterFilter = new Filter('Filter', () => {
            this.api.fetchFilters()
                .catch((e) => {
                    this.showConfigurationError(e);
                })
                .then((filters) => {
                    this.setFilters(filters);
                });
        }, (filter_id) => {
            // this.resetFeatures();
            this.selectedFilterId = filter_id;
            this.reloadFeatures();
        });
        //  Create "Project" filter.
        this.projectFilter = new Filter('Project', () => {
            this.api.fetchProjects()
                .catch((e) => {
                    this.showConfigurationError(e);
                })
                .then((projects) => {
                    this.setProjects(projects);
                });
        }, (project_id) => {
            // this.resetFeatures();
            this.selectedProjectId = project_id;
            this.reloadFeatures();
            // this.emitter.emit('did-select-project', project_id);
        });
        //  Create message container.
        this.messageElement = document.createElement('div');
        this.addClass(this.messageElement, 'message');
        //  Create list to contain Axosoft items.
        this.ulElement = document.createElement('ul');
        this.addClass(this.ulElement, 'feature-list');
        //  Create workflow step selector.
        this.workstepSelector = new AxosoftWorkflowStepSelector();

        //  Nest elements.
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
            if (serializedState.workflowSteps) {
                this.setWorkflowSteps(serializedState.workflowSteps);
            }
        }
    }

    // onDidRequestProjects(callback) {
    //     return this.emitter.on('did-request-projects', () => {
    //         console.log('onDidRequestProjects fired');
    //         callback();
    //     });
    // }

    // onDidSelectProject(callback) {
    //     return this.emitter.on('did-select-project', (project) => {
    //         console.log('onDidSelectProject fired');
    //         callback(project);
    //     });
    // }

    // onDidRequestFilters(callback) {
    //     return this.emitter.on('did-request-filters', () => {
    //         console.log('onDidRequestFilters fired');
    //         callback();
    //     });
    // }

    // onDidSelectFilter(callback) {
    //     return this.emitter.on('did-select-filter', (filter) => {
    //         console.log('onDidSelectFilter fired');
    //         callback(filter);
    //     });
    // }

    didRequestWorkflowStepSelection(feature) {
        console.log('feature requested workflow step select');
        console.log(feature.workflowStep);
        if (this.workstepSelector) {
            this.workstepSelector.selectWorkflowStep(
                feature.workflowStep
            );
        }
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
        if (this.panel != null) {
            this.panel.destroy();
        }
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

    showConfigurationError(messageSupplement, messageType) {
        let message = 'Please configure your Axosoft access token and URL in the package settings.';
        if (messageSupplement) {
            message += '\n\n' + messageSupplement;
        }
        this.setMessage(
            message,
            messageType || 'warning'
        );
    }

    setWorkflowSteps(workflowSteps) {
        this.workflowSteps = workflowSteps;
        this.workstepSelector.setItems(this.workflowSteps);

    }


    reloadFeatures() {

        this.resetFeatures();

        // this.setIsLoading(true)
        let options = {
            'filter_id': this.selectedFilterId,
            'project_id': this.selectedProjectId
        };


        this.api.fetchWorkItems(options)
            .catch((e) => {
                this.showConfigurationError(e);
            })
            .then((workItems) => {
                this.setFeatures(workItems);
            });
    }


    setFeatures(features) {
        this.resetFeatures();
        this.features = features;
        this.resetMessage();
        console.log(this.features);
        for (let i = 0; i < this.features.length; ++i) {
            let feature = new Feature({
                'feature': this.features[i],
                'ulElement': this.ulElement,
                'onDidRequestWorkflowStepSelection': this.didRequestWorkflowStepSelection
            });
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
    // removeClass(element, className) {
    //     element.classList.remove(
    //         this.prefixClass(className)
    //     );
    // }



};
