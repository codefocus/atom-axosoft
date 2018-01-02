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
        this.filters = [];
        this.projects = [];
        this.workflowSteps = [];
        this.selectedFilterId = null;
        this.selectedProjectId = null;
        this.emitter = new Emitter;
        this.api = new AtomAxosoftApi(
            this,
            atom.config.get('atom-axosoft.axosoftUrl'),
            atom.config.get('atom-axosoft.accessToken')
        );
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
            this.selectedProjectId = project_id;
            this.reloadFeatures();
        });
        //  Create message container.
        this.messageElement = document.createElement('div');
        this.addClass(this.messageElement, 'message');
        //  Create list to contain Axosoft items.
        this.ulElement = document.createElement('ul');
        this.addClass(this.ulElement, 'feature-list');
        //  Create workflow step selector.
        this.workflowStepSelector = new AxosoftWorkflowStepSelector;
        this.workflowStepSelector.setApi(this.api);
        this.workflowStepSelector.onConfirmed((step, feature) => {
            this.api.updateFeatureWorkflowStep(feature.feature.id, step.id)
                .catch((e) => {
                    feature.disabled = false;
                })
                .then(() => {
                    feature.workflowStep = step;
                    feature.disabled = false;
                });
        });
        this.workflowStepSelector.onCancelled((feature) => {
            feature.disabled = false;
        });

        //  Nest elements.
        this.element.appendChild(this.filterFilter.containerElement);
        this.element.appendChild(this.projectFilter.containerElement);
        this.element.appendChild(this.messageElement);
        this.element.appendChild(this.ulElement);
        //  Load serialized state
        if (serializedState) {
            if (serializedState.filters && serializedState.filters.length) {
                this.setFilters(serializedState.filters);
            }
            if (serializedState.selectedFilterId) {
                this.filterFilter.select(serializedState.selectedFilterId);
            }
            if (serializedState.projects && serializedState.projects.length) {
                this.setProjects(serializedState.projects);
            }
            if (serializedState.selectedProjectId) {
                this.projectFilter.select(serializedState.selectedProjectId);
            }
            if (serializedState.features && serializedState.features.length) {
                this.setFeatures(serializedState.features);
            }
        }
    }

    didRequestWorkflowStepSelection(feature) {
        feature.disabled = true;
        if (this.workflowStepSelector) {
            this.workflowStepSelector.selectWorkflowStep(
                feature
            );
        }
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {
        return {
            filters: this.filters,
            projects: this.projects,
            features: this.features,
            workflowSteps: this.workflowSteps,
            selectedFilterId: this.selectedFilterId,
            selectedProjectId: this.selectedProjectId
        };
    }

    // Tear down any state and detach
    destroy() {
        // if (this.panel != null) {
        //     this.panel.destroy();
        // }
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
        this.resetMessage();
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
        var message = 'Please configure your Axosoft access token and URL in the package settings.';
        if (messageSupplement) {
            if (messageSupplement instanceof Error) {
                message += '<br><br>' + messageSupplement.message;
            } else {
                message += '<br><br>' + messageSupplement;
            }
        }
        this.setMessage(
            message,
            messageType || 'warning'
        );
    }

    configChanged(key, oldValue, newValue) {
        this.reset();
        if (key == 'axosoftUrl') {
            this.api.axosoftUrl = newValue;
            this.reloadFeatures();
        } else if (key == 'accessToken') {
            this.api.accessToken = newValue;
            this.reloadFeatures();
        }
    }

    reloadFeatures() {
        this.resetFeatures();
        this.resetMessage();
        let options = {
            'filter_id': this.selectedFilterId,
            'project_id': this.selectedProjectId
        };

        this.api.fetchWorkItems(options)
            .catch((e) => {
                this.showConfigurationError(e);
            })
            .then((workItems, e) => {
                if (e || !workItems) {
                    return;
                }
                this.setFeatures(workItems);
            });
    }


    setFeatures(features) {
        this.resetFeatures();
        this.features = features;
        this.resetMessage();
        for (let i = 0; i < this.features.length; ++i) {
            let feature = new Feature({
                'feature': this.features[i],
                'ulElement': this.ulElement,
                'onDidRequestWorkflowStepSelection': this.didRequestWorkflowStepSelection.bind(this)
            });
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


};
