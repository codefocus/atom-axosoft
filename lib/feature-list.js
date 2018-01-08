'use babel';

import AxosoftDomElement from './axosoft-dom-element';
import { Emitter } from 'event-kit';
const animate = require('amator');
import Feature from './feature';
const fuzzaldrin = require('fuzzaldrin');

export default class FeatureList extends AxosoftDomElement {

    /**
     *  Constructor.
     *
     *  @param object options
     */
    constructor(options) {
        super();
        options = options || {};
        this.element = null;
        this.features = options.features || [];
        this.element = this.createFeatureListElement();
    }

    /**
     *  Create feature list element.
     *
     *  @return HTMLElement
     */
    createFeatureListElement() {
        let element = this._el('ul', '_feature-list');

        return element;
    }

    /**
     *  Reset the FeatureList.
     *  Removes all Features.
     */
    reset() {
        this.features = [];
        this.element.innerHTML = '';
    }

    /**
     *  Add a Feature
     *
     *  @param Feature feature
     */
    add(feature) {
        // this.element.appendChild(feature.element);
        this.features.push(feature);

        if (feature.feature.parent && feature.feature.parent.id) {
            let parentId = feature.feature.parent.id;
            let parentFeature = this.getFeatureById(parentId);
            if (parentFeature) {
                parentFeature.addChild(feature);
                return;
            // } else {
            //     feature.element.style.opacity = .3;
            }
        }
        this.element.appendChild(feature.element);
    }

    /**
     *  Remove a Feature.
     *
     *  @param Feature feature
     */
    remove(feature) {
        throw Error('Not implemented yet');
    }


    filter(query) {
        if(this.features.length) {
            let matchingFeatures = fuzzaldrin.filter(
                this.features,
                query,
                {
                    key: 'featureName'
                }
            );
            this.features.forEach((feature) => {
                if (matchingFeatures.indexOf(feature) != -1) {
                    feature.filtered = false;
                    return;
                }
                if (feature.children.length) {
                    if (feature.children.find((child) => {
                        return (matchingFeatures.indexOf(child) != -1);
                    })) {
                        feature.filtered = false;
                        return;
                    }
                }

                feature.filtered = true;
            });
        }
    }

    setFeatures(features, onDidRequestWorkflowStepSelection) {
        this.reset();
        for (let i = 0; i < features.length; ++i) {
            let feature = new Feature({
                'feature': features[i],
                'ulElement': this.element,
                'onDidRequestWorkflowStepSelection': onDidRequestWorkflowStepSelection
            });
            this.add(feature);
        }
    }

    getFeatureById(id) {
        return this.features.find((feature) => {
            return feature.feature.id == id;
        });
    }

    serialize() {
        let features = [];
        this.features.forEach((featureView) => {
            features.push(featureView.feature);
        })

        return features;
    }

}
