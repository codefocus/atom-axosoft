'use babel';

// const nodeAxosoft = require('node-axosoft/promise');

// const nodeAxosoft = require('./node-axosoft/node-axosoft.js');
import nodeAxosoft from './node-axosoft/lib/node-axosoft';





export default class AtomAxosoftApi {
    /**
     *  Constructor
     *
     *  @param AxosoftView view
     */
    constructor(view, axosoftUrl, accessToken) {
        this.MAX_ITEMS = 64;
        this.data = {
            workflowSteps: [],
            projects: [],
            filters: [],
            workItems: []
        };
        this.config = {
            axosoftUrl: axosoftUrl,
            accessToken: accessToken,
            isValid: false
        };
        this.config.isValid = this.isConfigurationValid();
        this.view = view;
        this.apiConsumer = null;
    }

    set axosoftUrl(value) {
        this.config.axosoftUrl = value;
        this.config.isValid = this.isConfigurationValid();
        this.apiConsumer = null;
    }

    set accessToken(value) {
        this.config.accessToken = value;
        this.config.isValid = this.isConfigurationValid();
        this.apiConsumer = null;
    }

    /**
     *  Returns whether the configuration differs from the default.
     *
     *  @return bool
     */
    isConfigurationValid() {
        if (this.config.axosoftUrl == atom.config.defaultSettings['atom-axosoft'].axosoftUrl) {
            return false;
        }
        if (this.config.accessToken == atom.config.defaultSettings['atom-axosoft'].accessToken) {
            return false;
        }

        return true;
    }

    /**
     *  Creates and returns a new nodeAxosoft instance.
     *
     *  @return nodeAxosoft
     */
    createAxosoftApiConsumer() {
        if ( ! this.config.isValid) {
            throw new Error;
        }
        this.apiConsumer = nodeAxosoft(
            this.config.axosoftUrl,
            {
                access_token: this.config.accessToken
            }
        );
        if ( ! this.apiConsumer) {
            throw new Error('Could not create the Axosoft API consumer');
        }

        return this.apiConsumer;
    }

    /**
     *  Returns the nodeAxosoft instance.
     *
     *  @return nodeAxosoft
     */
    getApiConsumer() {
        if (null == this.apiConsumer) {
            this.apiConsumer = this.createAxosoftApiConsumer();
        }

        return this.apiConsumer;
    }

    /**
     *  Fetch workflow steps.
     *
     *  @param bool force
     *
     *  @return Promise
     */
    fetchWorkflowSteps(force) {
        return new Promise((resolve, reject) => {
            try {
                if (this.data.workflowSteps.length && ! force) {
                    resolve(this.data.workflowSteps);
                }
                //  @TODO: convert to non-promise
                this.getApiConsumer()
                    .Workflows
                    .get((response) => {
                        if (!response || response instanceof Error) {
                            reject(response);
                            return;
                        }
                        this.data.workflowSteps = response.data;
                        resolve(this.data.workflowSteps);
                    });
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     *  Fetch filters.
     *
     *  @param bool force
     *
     *  @return Promise
     */
    fetchFilters(force) {
        return new Promise((resolve, reject) => {
            try {
                if (this.data.filters.length && ! force) {
                    resolve(this.data.filters);
                }
                this.getApiConsumer()
                    .Filters
                    .get('features', (response) => {
                        if (!response || response instanceof Error) {
                            reject(response);
                            return;
                        }
                        this.data.filters = response.data;
                        resolve(this.data.filters);
                    });
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     *  Fetch projects.
     *
     *  @param bool force
     *
     *  @return Promise
     */
    fetchProjects(force) {
        return new Promise((resolve, reject) => {
            try {
                if (this.data.projects.length && ! force) {
                    resolve(this.data.projects);
                }
                var params = {
                    flat: true
                };
                this.getApiConsumer()
                    .Projects
                    .get(params, (response) => {
                        if (!response || response instanceof Error) {
                            reject(response);
                            return;
                        }
                        this.data.projects = response.data;
                        resolve(this.data.projects);
                    });
            }
            catch(e) {
                reject(e);
            }
        });
    }


    /**
     *  Fetch workItems.
     *
     *  @return Promise
     */
    fetchWorkItems(options) {
        return new Promise((resolve, reject) => {
            try {
                // optional parameters
                var params = {};
                // params.columns = 'id,name,priority,status';
                params.include_sub_releases_items = true;
                params.page_size = this.MAX_ITEMS;
                params.sort_fields = 'priority.order desc';
                if (options.project_id) {
                    params.project_id = options.project_id;
                    params.include_sub_projects_items = true;
                }
                if (options.filter_id) {
                    params.filter_id = options.filter_id;
                }
                this.getApiConsumer()
                    .Items
                    .getItems(params, (response) => {
                        if (!response || response instanceof Error) {
                            reject(response);
                            return;
                        }
                        this.data.workItems = response.data;
                        resolve(this.data.workItems);
                    });
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     *  Get available workflow steps for a feature.
     *
     *  @param int featureId
     *
     *  @return Promise
     */
    getFeatureWorkflowSteps(featureId) {
        return new Promise((resolve, reject) => {
            try {
                var params = {
                    flat: true
                };
                this.getApiConsumer()
                    .Features
                    .getWorkflowSteps(featureId, (response) => {
                        if (!response || response instanceof Error) {
                            reject(response);
                            return;
                        }
                        resolve(response.data || null);
                    });
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     *  Update a feature's current workflow step.
     *
     *  @param int featureId
     *  @param int workflowStepId
     *
     *  @return Promise
     */
    updateFeatureWorkflowStep(featureId, workflowStepId) {
        return new Promise((resolve, reject) => {
            try {
                var params = {
                    item: {
                        workflow_step: {
                            id: workflowStepId
                        }
                    }
                };
                this.getApiConsumer()
                    .Features
                    .update(featureId, params, (response) => {
                        if (!response || response instanceof Error) {
                            reject(response);
                            return;
                        }
                        resolve();
                    })
            }
            catch(e) {
                reject(e);
            }
        });

    }

}
