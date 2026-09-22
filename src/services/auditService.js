import { auditApi } from '../api/audit.api';

/**
 * Audit Service
 * Central business logic, formatting, and diff comparison utilities for Audit Logs.
 */
export const auditService = {
  /**
   * Fetch paginated audit logs with search/filters
   */
  async getAuditLogs(params = {}) {
    try {
      const response = await auditApi.getAuditLogs(params);
      const items = Array.isArray(response?.items) ? response.items : (Array.isArray(response) ? response : []);
      
      return {
        items,
        page: Number(response?.page) || 1,
        pageSize: Number(response?.pageSize) || (params.pageSize || 20),
        totalCount: Number(response?.totalCount) || items.length,
        totalPages: Number(response?.totalPages) || 1,
        hasPreviousPage: Boolean(response?.hasPreviousPage),
        hasNextPage: Boolean(response?.hasNextPage)
      };
    } catch (err) {
      console.error('auditService.getAuditLogs error:', err);
      throw err;
    }
  },

  /**
   * Fetch single audit log entry
   */
  async getAuditLogById(id) {
    try {
      return await auditApi.getAuditLogById(id);
    } catch (err) {
      console.error(`auditService.getAuditLogById(${id}) error:`, err);
      throw err;
    }
  },

  /**
   * Format action code into readable label
   * e.g. "product.updated" -> "Product Updated"
   */
  formatAction(action) {
    if (!action) return 'Unknown Action';
    return String(action)
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  },

  /**
   * Get badge style for action type
   */
  getActionBadge(action) {
    const act = String(action || '').toLowerCase();
    if (act.includes('created') || act.includes('added') || act.includes('promote')) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
        dot: 'bg-emerald-400',
        label: 'CREATED'
      };
    }
    if (act.includes('deleted') || act.includes('deactivated') || act.includes('demote') || act.includes('block') || act.includes('reject')) {
      return {
        bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
        dot: 'bg-rose-400',
        label: 'DELETED'
      };
    }
    if (act.includes('status') || act.includes('review') || act.includes('approve') || act.includes('hide')) {
      return {
        bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
        dot: 'bg-purple-400',
        label: 'STATUS'
      };
    }
    if (act.includes('translation')) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        dot: 'bg-amber-400',
        label: 'TRANSLATION'
      };
    }
    // Default: Updated
    return {
      bg: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
      dot: 'bg-blue-400',
      label: 'UPDATED'
    };
  },

  /**
   * Safely parse oldValue / newValue payload
   */
  parsePayload(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'object') return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return val;
        }
      }
      return val;
    }
    return val;
  },

  /**
   * Compute changes / differences between old and new values
   */
  computeChanges(oldVal, newVal) {
    const oldParsed = this.parsePayload(oldVal);
    const newParsed = this.parsePayload(newVal);

    if (!oldParsed && !newParsed) return [];
    if (!oldParsed && newParsed) {
      return [{ field: 'Created Entity', oldValue: null, newValue: newParsed }];
    }
    if (oldParsed && !newParsed) {
      return [{ field: 'Deleted Entity', oldValue: oldParsed, newValue: null }];
    }

    if (typeof oldParsed === 'object' && typeof newParsed === 'object' && !Array.isArray(oldParsed) && !Array.isArray(newParsed)) {
      const allKeys = Array.from(new Set([...Object.keys(oldParsed || {}), ...Object.keys(newParsed || {})]));
      const diffs = [];

      for (const key of allKeys) {
        const vOld = oldParsed[key];
        const vNew = newParsed[key];
        const strOld = JSON.stringify(vOld);
        const strNew = JSON.stringify(vNew);

        if (strOld !== strNew) {
          diffs.push({
            field: key,
            oldValue: vOld,
            newValue: vNew
          });
        }
      }

      return diffs.length > 0 ? diffs : [{ field: 'Entity', oldValue: oldParsed, newValue: newParsed }];
    }

    return [{ field: 'Payload', oldValue: oldParsed, newValue: newParsed }];
  }
};

export default auditService;
