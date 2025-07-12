module.exports = {
  USER_ROLES: {
    ADMIN: 'Admin',
    MEMBER: 'Member'
  },
  
  MEMBER_STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    EXPIRED: 'Expired'
  },
  
  MEMBERSHIP_TYPES: {
    BASIC: 'Basic',
    PREMIUM: 'Premium',
    VIP: 'VIP'
  },
  
  EVENT_STATUS: {
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  },
  
  PAYMENT_STATUS: {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    REFUNDED: 'Refunded'
  },
  
  ATTENDANCE_STATUS: {
    REGISTERED: 'Registered',
    ATTENDED: 'Attended',
    NO_SHOW: 'No Show'
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  }
};


