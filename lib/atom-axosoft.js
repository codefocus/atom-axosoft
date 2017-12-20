'use babel';

import AxosoftView from './axosoft-view';
import { CompositeDisposable } from 'atom';

const nodeAxosoft = require('node-axosoft/promise');

export default {
    axosoftView: null,
    panel: null,
    subscriptions: null,
    axo: null,
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
        this.axosoftView = new AxosoftView(state.axosoftViewState);

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
        console.log('fetchWorkItems 1');
        if (!this.axo) {
            console.log('fetchWorkItems 2');
            if (!this.isConfigurationValid()) {
                console.log('fetchWorkItems 3');
                return false;
            }
            if (!this.createAxosoftApiConsumer()) {
                console.log('fetchWorkItems 4');
                return false;
            }
        }
        console.log('fetchWorkItems 5');
        // optional parameters
        var params = {
            columns: 'id,name,priority',
            'search_field': 'name',
            'search_string': 'prefeed'
        };
        this.axo.Features
            .get(params)
            .then((response) => {
                this.axosoftView.setFeatures(response.data);
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
