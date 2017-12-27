'use babel';

import AxosoftView from './axosoft-view';
import AxosoftSerializer from './atom-axosoft-serializer';
import { CompositeDisposable } from 'atom';

export default {


    axosoftView: null,
    panel: null,
    subscriptions: null,
    axo: null,
    // filters: {
    //     project: null,
    //     filter: null
    // },
    // data: {
    //     projects: [],
    //     filters: []
    // },
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

    activate(state) {
        console.log('atom-axosoft was activated');
        this.axosoftView = new AxosoftView(
            state.axosoftViewState
        );
        atom.config.observe(
            'atom-axosoft.axosoftUrl',
            () => {
                this.configChanged();
            }
        );
        atom.config.observe(
            'atom-axosoft.accessToken',
            () => {
                this.configChanged();
            }
        );
        atom.workspace.open(this.axosoftView);
        // Events subscribed to in atom's system
        // can be easily cleaned up with a CompositeDisposable.
        this.subscriptions = new CompositeDisposable();
        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'axosoft:toggle': () => this.toggle()
        }));
    },

    deactivate() {
        console.log('atom-axosoft was deactivated');
        // this.panel.destroy();

        this.axosoftView.destroy();
        this.subscriptions.dispose();
    },

    serialize() {
        return {
            deserializer: 'AxosoftSerializer',
            axosoftViewState: this.axosoftView.serialize()
        };
    },

    configChanged() {
        // this.axosoftView.resetMessage();
        // console.log('Config changed!!');
        // this.axosoftView.reset();
        //  @TODO: call this from view.
        // this.fetchWorkItems();
    },

    toggle() {
        console.log('atom-Axosoft was toggled!');
        // if (!this.axosoftView) {
        //     return;
        // }
        return atom.workspace.toggle('atom://atom-axosoft');
        // return atom.workspace.toggle(this.axosoftView);
    },

    handleAtomURI(parsedUri) {
        console.log(parsedUri);
    }
};
