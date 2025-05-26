'use strict';

const DocumentRegistry = require('./lib/document-registry');
const ApprovalFlow = require('./lib/approval-flow');
const DocumentVerification = require('./lib/verification');

module.exports.DocumentRegistry = DocumentRegistry;
module.exports.ApprovalFlow = ApprovalFlow;
module.exports.DocumentVerification = DocumentVerification;

module.exports.contracts = [DocumentRegistry, ApprovalFlow, DocumentVerification];
