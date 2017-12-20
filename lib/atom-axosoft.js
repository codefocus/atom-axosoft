'use babel';

import AxosoftView from './axosoft-view';
import { CompositeDisposable } from 'atom';

const nodeAxosoft = require('node-axosoft/promise');

export default {
    axosoftView: null,
    panel: null,
    subscriptions: null,
    axo: null,
    filters: {},
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
        console.log('createAxosoftApiConsumer');
        this.axo = nodeAxosoft(
            atom.config.get('atom-axosoft.axosoftUrl'),
            {
                access_token: atom.config.get('atom-axosoft.accessToken')
            }
        );

        return true;
    },

    activate(state) {
        console.log('activate');
        this.axosoftView = new AxosoftView(
            state.axosoftViewState
        );
        // process.nextTick(() => {
        //     this.axosoftView.onDidRequestProjects(
        //         this.fetchProjects
        //     );
        // });

        atom.config.observe(
            'atom-axosoft.axosoftUrl',
            () => this.fetchWorkItems
        );
        atom.config.observe(
            'atom-axosoft.accessToken',
            () => this.fetchWorkItems
        );
        this.fetchWorkItems();
        atom.workspace.open(this.axosoftView);

        // this.panel = atom.workspace.addPanel('right', {
        //     item: this.axosoftView.getElement(),
        //     visible: false
        // });

        // // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();
        //
        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'axosoft:toggle': () => this.toggle()
        }));
        this.subscriptions.add(
            this.axosoftView.onDidRequestProjects(
                () => {
                    this.fetchProjects();
                }
            )
        );
        this.subscriptions.add(
            this.axosoftView.onDidSelectProject(
                (project) => {
                    this.filters.project = project;
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

    fetchWorkItems() {
        if (!this.axo) {
            if (!this.isConfigurationValid()) {
                return false;
            }
            if (!this.createAxosoftApiConsumer()) {
                return false;
            }
        }
        // optional parameters
        var params = {
            columns: 'id,name,priority',
            'search_field': 'name',
            'search_string': 'prefeed'
        };
        if (this.filters.project) {
            params.project_id = this.filters.project.id;
            params.include_sub_projects_items = true;
        }
        this.axo.Features
            .get(params)
            .then((response) => {
                this.axosoftView.setFeatures(response.data);
            });
    },

    fetchProjects() {
        if (!this.axo) {
            if (!this.isConfigurationValid()) {
                return false;
            }
            if (!this.createAxosoftApiConsumer()) {
                return false;
            }
        }
        // optional parameters
        // var params = {
        //     columns: 'id,name,priority',
        //     'search_field': 'name',
        //     'search_string': 'prefeed'
        // };
        var params = {
            flat: true
        };

        this.axo.Projects
            .get(params)
            .then((response) => {
                this.axosoftView.setProjects(response.data);
            });
    },

    toggle() {
        console.log('Axosoft was toggled!');

        if (!this.axosoftView) {
            return;
        }

        return atom.workspace.toggle(this.axosoftView);

        // if (this.panel.isVisible()) {
        //     return this.panel.hide();
        // }
        //
        // // optional parameters
        // var params = {
        //     columns: 'id,name',
        //     'search_field': 'name',
        //     'search_string': 'prefeed'
        // };
        // this.axo.Features
        //     .get(params)
        //     .then((response) => {
        //         this.axosoftView.setFeatures(response.data);
        //     });
        //
        //
        // return this.panel.show();
    }

};
