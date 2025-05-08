// Application route paths
const PATHS = {
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
    PROFILE: '/users/profile'
  },
  DASHBOARD: '/dashboard',
  PETS: {
    INDEX: '/pets',
    ADD: '/pets/add',
    EDIT: (id) => `/pets/${id}/edit`,
    SHOW: (id) => `/pets/${id}`
  },
  SERVICES: {
    INDEX: '/services',
    SHOW: (id) => `/services/${id}`
  },
  APPOINTMENTS: {
    BOOK: '/appointments/book',
    INDEX: '/appointments',
    SHOW: (id) => `/appointments/${id}`
  }
};

module.exports = PATHS; 