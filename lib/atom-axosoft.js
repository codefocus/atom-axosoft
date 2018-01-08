'use babel';

import AxosoftView from './axosoft-view';
import AxosoftSerializer from './atom-axosoft-serializer';
import { CompositeDisposable } from 'atom';
// import {Panetastic} from 'atom-panetastic';
// const Panetastic = require('atom-panetastic');


export default {
    axosoftView: null,
    panel: null,
    subscriptions: null,
    axo: null,
    textEditor: null,
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

    initialize() {
        console.log('atom-axosoft initialize');
    },

    activate(state) {
        console.log('atom-axosoft.activate');
        this.axosoftView = new AxosoftView(
            state.axosoftViewState
        );
        // this.pane = new Panetastic(
        //     {
        //         view: AxosoftView,
        //         params: {
        //             title: "I'm embedded",
        //             params: state.axosoftViewState,
        //             active: true,
        //
        //         },
        //         active: true,
        //     }
        // );
        // console.log(this.pane);
        // window.qqq = this.pane;
        // this.axosoftView = this.pane.subview;
        atom.workspace.open(this.axosoftView).then((textEditor) => {
            this.textEditor = textEditor;
        });
        //  Events subscribed to in atom's system
        //  can be easily cleaned up with a CompositeDisposable.
        this.subscriptions = new CompositeDisposable();
        //  Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'axosoft:toggle': () => this.toggle()
        }));
        //  Monitor configuration changes.
        this.subscriptions.add(
            atom.config.onDidChange('atom-axosoft.axosoftUrl',
                ({newValue, oldValue}) => {
                    this.configChanged('axosoftUrl', oldValue, newValue);
                }
            )
        );
        this.subscriptions.add(
            atom.config.onDidChange('atom-axosoft.accessToken',
                ({newValue, oldValue}) => {
                    this.configChanged('accessToken', oldValue, newValue);
                }
            )
        );
    },


    deactivate() {
        console.log('atom-axosoft.deactivate');

        // this.panel.destroy();
        this.axosoftView.destroy();
        this.axosoftView = null;
        if (this.textEditor) {
            console.log('destroy textEditor');
            // if (this.textEditor.element) {
            //     console.log('destroy textEditor 1');
            //     let parent = this.textEditor.element.parentElement;
            //     if (parent) {
            //         console.log('destroy textEditor 2');
            //         parent = parent.parentElement;
            //         if (parent) {
            //             console.log('destroy textEditor 3');
            //             // console.log('destroy textEditor parent');
            //             parent.remove();
            //             parent = null;
            //         }
            //     }
            // }
            this.textEditor.destroy();

            this.textEditor = null;
        }
        // atom.workspace.toggle(this.axosoftView);
        this.subscriptions.dispose();
        this.subscriptions = null;


    },

    serialize() {
        // console.log('atom-axosoft.serialize');
        return {
            deserializer: 'AxosoftSerializer',
            axosoftViewState: this.axosoftView.serialize()
        };
    },

    configChanged(key, oldValue, newValue) {
        console.log('atom-axosoft.configChanged');
        process.nextTick(() => {
            this.axosoftView.configChanged(key, oldValue, newValue);
        });
    },

    toggle() {
        console.log('atom-axosoft.toggle');
        // if (this.subscriptions) {
        //     this.subscriptions.dispose();
        // }
        // if (!this.axosoftView) {
        //     return;
        // }
        return atom.workspace.toggle(this.axosoftView);
        // return atom.workspace.toggle(this.axosoftView);
    },

    handleAtomURI(parsedUri) {
        console.log('atom-axosoft.handleAtomURI');
        console.log(parsedUri);
    }
};
