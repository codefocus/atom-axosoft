var pkg = require('../package.json');

function NodeAxosoft (base_url, credentials) {

	var node_axosoft = {
		VERSION: pkg.version,
		Api: require('./api'),
		Activity: require('./activity.js'),
		Attachments: require('./attachments.js'),
		Comments: require('./comments.js'),
		Contacts: require('./contacts.js'),
		Customers: require('./customers.js'),
		Defects: require('./defects.js'),
		Features: require('./features.js'),
		Filters: require('./filters.js'),
		Tasks: require('./tasks.js'),
		Incidents: require('./incidents.js'),
		Items: require('./items.js'),
		Emails: require('./emails.js'),
		Fields: require('./fields.js'),
		ItemRelations: require('./item_relations.js'),
		Me: require('./me.js'),
		Picklists: require('./picklists.js'),
		Projects: require('./projects.js'),
		Releases: require('./releases.js'),
		Security: require('./security.js'),
		SecurityRoles: require('./security_roles.js'),
		Settings: require('./settings.js'),
		Teams: require('./teams.js'),
		Users: require('./users.js'),
		WorkLogs: require('./work_logs.js'),
		WorkflowSteps: require('./workflow_steps.js'),
		Workflows: require('./workflows.js')
	};

	node_axosoft.Api.register(base_url, credentials);

	return node_axosoft;
}

// Finally, export `NodeAxosoft` to the world.
module.exports = NodeAxosoft;
