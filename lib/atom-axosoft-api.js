'use babel';

const nodeAxosoft = require('node-axosoft/promise');

export default class AtomAxosoftApi {
    /**
     *  Constructor
     *
     *  @param AxosoftView view
     */
    constructor(view) {
        this.data = {
            projects: [],
            filters: []
        };

        this.view = view;
        this.apiConsumer = null;
    }

    /**
     *  Returns whether the configuration differs from the default.
     *
     *  @return bool
     */
    isConfigurationValid() {
        console.log('isConfigurationValid');
        if (atom.config.get('atom-axosoft.axosoftUrl') == atom.config.defaultSettings['atom-axosoft'].axosoftUrl) {
            console.log('NO');
            return false;
        }
        if (atom.config.get('atom-axosoft.accessToken') == atom.config.defaultSettings['atom-axosoft'].accessToken) {
            console.log('NO');
            return false;
        }
        console.log('YES');

        return true;
    }

    /**
     *  Creates and returns a new nodeAxosoft instance.
     *
     *  @return nodeAxosoft
     */
    createAxosoftApiConsumer() {
        if ( ! this.isConfigurationValid()) {
            throw new Error;
        }
        this.apiConsumer = nodeAxosoft(
            atom.config.get('atom-axosoft.axosoftUrl'),
            {
                access_token: atom.config.get('atom-axosoft.accessToken')
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
        console.log(this.apiConsumer);

        return this.apiConsumer;
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
                    .get('features')
                    .catch((e) => {
                        reject(e);
                    })
                    .then((response) => {
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
                    .get(params)
                    .catch((e) => {
                        reject(e);
                    })
                    .then((response) => {
                        this.data.projects = response.data;
                        resolve(this.data.projects);
                    });
            }
            catch(e) {
                reject(e);
            }
        });
    }

}
