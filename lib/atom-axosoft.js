'use babel';

import AxosoftView from './axosoft-view';
import { CompositeDisposable } from 'atom';

const nodeAxosoft = require('node-axosoft/promise');

export default {

    MAX_ITEMS: 64,
    axosoftView: null,
    panel: null,
    subscriptions: null,
    axo: null,
    filters: {
        project: null,
        filter: null
    },
    data: {
        projects: [],
        filters: []
    },
    config: {
        "axosoftUrl": {
            "description": "Your company's axosoft url.",
            "type": "string",
            "default": "https://example.axosoft.com"
        },
        "accessToken": {
            //  Create Non Expiring Token:
            //  - Log into Axosoft account
            //  - Click on Tools/System Options/Axosoft API Settings/Manage Tokens
            //  - Make non-expiring token.
            "description": "Your non-expiring axosoft token.",
            "type": "string",
            "default": ""
        }
    },

    isConfigurationValid() {
        console.log('isConfigurationValid');
        if (atom.config.get('atom-axosoft.axosoftUrl') == this.config.axosoftUrl.default) {
            return false;
        }
        if (atom.config.get('atom-axosoft.accessToken') == this.config.accessToken.default) {
            return false;
        }

        return true;
    },


    createAxosoftApiConsumer() {
        this.axo = nodeAxosoft(
            atom.config.get('atom-axosoft.axosoftUrl'),
            {
                access_token: atom.config.get('atom-axosoft.accessToken')
            }
        );

        return true;
    },


    activate(state) {
        this.axosoftView = new AxosoftView(
            state.axosoftViewState
        );
        atom.config.observe(
            'atom-axosoft.axosoftUrl',
            () => this.configChanged
        );
        atom.config.observe(
            'atom-axosoft.accessToken',
            () => this.configChanged
        );
        // this.fetchProjects();
        // this.fetchWorkItems();
        // this.fetchFilters();
        atom.workspace.open(this.axosoftView);
        // Events subscribed to in atom's system
        // can be easily cleaned up with a CompositeDisposable.
        this.subscriptions = new CompositeDisposable();
        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'axosoft:toggle': () => this.toggle()
        }));
        this.subscriptions.add(
            this.axosoftView.onDidRequestProjects(() => {
                this.fetchProjects();
            })
        );
        this.subscriptions.add(
            this.axosoftView.onDidRequestFilters(() => {
                this.fetchFilters();
            })
        );
        this.subscriptions.add(
            this.axosoftView.onDidSelectProject(
                (id) => {
                    // console.log('onDidSelectProject received');
                    this.filters.project = id;
                    this.fetchWorkItems();
                }
            )
        );
        this.subscriptions.add(
            this.axosoftView.onDidSelectFilter(
                (id) => {
                    // console.log('onDidSelectFilter received');
                    this.filters.filter = id;
                    this.fetchWorkItems();
                }
            )
        );
    },

    deactivate() {
        // this.panel.destroy();
        this.subscriptions.dispose();
        this.axosoftView.destroy();
    },

    serialize() {
        return {
            axosoftViewState: this.axosoftView.serialize()
        };
    },

    configChanged() {
        this.axosoftView.resetFeatures();
        this.fetchWorkItems();
    },

    fetchWorkItems() {
        if (!this.axo) {
            if (!this.isConfigurationValid()) {
                this.axosoftView.setMessage('Invalid configuration', 'warning');
                return false;
            }
            if (!this.createAxosoftApiConsumer()) {
                this.axosoftView.setMessage('Could not create Axosoft API consumer', 'error');
                return false;
            }
        }
        try {
            // optional parameters
            var params = {};
            // params.columns = 'id,name,priority,status';
            params.include_sub_releases_items = true;
            params.page_size = this.MAX_ITEMS;
            params.sort_fields = 'priority.order desc';
            if (this.filters.project) {
                params.project_id = this.filters.project;
                params.include_sub_projects_items = true;
            }
            if (this.filters.filter) {
                params.filter_id = this.filters.filter;
            }
            console.log('Requesting Axosoft items');
            this.axo.Items
                .getItems(params)
                .catch((e) => {
                    console.log(' -- CAUGHT 1');
                    console.log(e);
                    this.axosoftView.setMessage(e, 'error');
                })
                .then((response) => {
                    console.log(response.data);
                    this.axosoftView.setFeatures(response.data);
                });
        }
        catch(e) {
            console.log(' -- CAUGHT 2');
            console.log(e);
            this.axosoftView.setMessage(e, 'error');
        }
    },

    fetchProjects(force) {
        if (!this.axo) {
            if (!this.isConfigurationValid()) {
                return false;
            }
            if (!this.createAxosoftApiConsumer()) {
                return false;
            }
        }
        if (this.data.projects.length) {
            if (!force) {
                return this.axosoftView.setProjects(this.data.projects);
            }
        }
        var params = {
            flat: true
        };
        this.axo.Projects
            .get(params)
            .then((response) => {
                this.data.projects = response.data;
                this.axosoftView.setProjects(this.data.projects);
            });
    },

    fetchFilters(force) {
        if (!this.axo) {
            if (!this.isConfigurationValid()) {
                return false;
            }
            if (!this.createAxosoftApiConsumer()) {
                return false;
            }
        }
        if (this.data.filters.length) {
            if (!force) {
                return this.axosoftView.setFilters(this.data.filters);
            }
        }
        this.axo.Filters
            .get('features')
            .then((response) => {
                console.log(response);
                this.data.filters = response.data;
                this.axosoftView.setFilters(this.data.filters);
            });
    },

    toggle() {
        console.log('atom-Axosoft was toggled!');
        // if (!this.axosoftView) {
        //     return;
        // }

        return atom.workspace.toggle(this.axosoftView);
    },

    handleAtomURI(parsedUri) {
        console.log(parsedUri);
    }

};
