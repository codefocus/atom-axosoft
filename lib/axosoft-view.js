'use babel';

import { Emitter } from 'event-kit';
import Feature from './feature';
import Filter from './filter';
import AtomAxosoftApi from './atom-axosoft-api';
import AxosoftWorkflowStepSelector from './axosoft-select-workflow-step';
import AxosoftDomElement from './axosoft-dom-element.js';
const animate = require('amator');
// import {TextEditorView} from 'atom-space-pen-views';
// import {TextEditor} from 'atom-space-pen-views';
import {TextEditor} from 'atom';
const fuzzaldrin = require('fuzzaldrin');


export default class AxosoftView {
    /**
     *  Constructor
     *
     *  @param object serializedState
     */
    constructor(serializedState) {
        console.log('axosoft-view.constructor');
        console.log(serializedState);
        // super();
        this.filters = [];
        this.projects = [];
        this.features = [];
        this.featureViews = [];
        this.workflowSteps = [];
        this.selectedFilterId = null;
        this.selectedProjectId = null;
        this.emitter = new Emitter;
        this.api = new AtomAxosoftApi(
            this,
            atom.config.get('atom-axosoft.axosoftUrl'),
            atom.config.get('atom-axosoft.accessToken')
        );
        this.dom = new AxosoftDomElement;
        //  Create root element.
        this.element = this.dom.createElement('div', 'atom-axosoft');
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
        this.messageElement = this.dom.createElement('div', '_message');
        //  Create list to contain Axosoft items.
        this.ulElement = this.dom.createElement('ul', '_feature-list');
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

        this.fuzzyFilter = new TextEditor({
            mini: true,
            placeholderText: "Filter by name"
        });
        // this.fuzzyFilter = this.dom._el('atom-text-editor');
        // this.fuzzyFilter.mini = true;
        let labelElement = this.dom._el('label', 'control-label');
        labelElement.textContent = 'Search';
        this.fuzzyFilterContainerElement = this.dom._el(
            'div',
            ['_filter', 'settings-view', 'control-group'],
            [
                this.dom._el(
                    'div',
                    'controls',
                    [
                        labelElement,
                        this.fuzzyFilter.element,
                    ]
                )
            ]
        );
        this.fuzzyFilter.onDidChange(() => {
            this.setFilterQuery(this.fuzzyFilter.getText());
        });
        window.fuzzyplop = this.fuzzyFilter;
        // this.dom._on(this.fuzzyFilter, 'change', (e, f) => {
        //     console.log('fuzzy onchange');
        //     console.log(e);
        //     console.log(f);
        //
        // });



        // this.fuzzyFilter = this.dom._el('input', 'form-control');
        this.element.appendChild(this.fuzzyFilterContainerElement);

        // _this.subview('filterEditorView', new TextEditorView({
        //   mini: true
        // }));
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

    initialize() {
        console.log('axosoft-view.initialize');
    }

    didRequestWorkflowStepSelection(feature) {
        feature.disabled = true;
        if (this.workflowStepSelector) {
            this.workflowStepSelector.selectWorkflowStep(
                feature
            );
        }
    }

    setFilterQuery(query) {
        console.log('setFilterQuery');
        console.log(query);

        if(this.featureViews.length) {
            console.log(this.featureViews);
            let matchingFeatureViews = fuzzaldrin.filter(
                this.featureViews,
                query,
                {
                    key: 'featureName'
                }
            );
            console.log('matchingFeatureViews');
            console.log(matchingFeatureViews);
            this.featureViews.forEach((featureView) => {
                featureView.filtered = (matchingFeatureViews.indexOf(featureView) == -1)
                //  @TODO: use fuzzaldrin
                // featureView.filtered = (featureView.feature.name.indexOf(query) == -1);
            });
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
        if (this.emitter) {
            this.emitter.dispose();
            this.emitter = null;
        }
        if (this.element) {
            this.element.remove();
        }

        if (this.filterFilter) {
            // this.filterFilter.dispose();
            this.filterFilter = null;
        }
        if (this.projectFilter) {
            // this.projectFilter.dispose();
            this.projectFilter = null;
        }
        if (this.workflowStepSelector) {
            // this.workflowStepSelector.dispose();
            this.workflowStepSelector = null;
        }


    }

    // destroy () {
    //   this.items.forEach(item => item.destroy());
    //   this.items = null;
    //
    //   this.subscriptions.dispose();
    //   this.subscriptions = null;
    //
    //   this.hide();
    //   this.element.removeEventListener('scroll', this.drawGutter);
    //   this.element = null;
    //
    //   window.removeEventListener('resize', this.drawGutter);
    //
    //   this.emitter.emit('did-destroy');
    //   this.emitter.dispose();
    //   this.emitter = null;
    // }

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
        this.featureViews = [];
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
            this.featureViews.push(feature);
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
