const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} params
 * @param {string} params.action - Description of action performed
 * @param {string} params.entity - Entity type: 'User' | 'Project' | 'Task' | 'Auth'
 * @param {ObjectId} params.entityId - ID of the affected entity
 * @param {ObjectId} params.performedBy - ID of the user performing the action
 * @param {Object} params.details - Additional details
 * @param {string} params.ipAddress - IP address of the requester
 */
const createAuditLog = async ({ action, entity, entityId, performedBy, details = {}, ipAddress = '' }) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      performedBy,
      details,
      ipAddress,
    });
  } catch (error) {
    // Don't let audit log failures break the main flow
    console.error('Audit log error:', error.message);
  }
};

module.exports = createAuditLog;
