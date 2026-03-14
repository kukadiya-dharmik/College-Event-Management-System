/* ===========================================================
   app.js  —  College Event Management System
   AngularJS 1.x  |  Module · Routing · Controllers · Filters
   =========================================================== */

(function () {
  'use strict';

  /* ============================================================
     MODULE — eventApp
     Depends on: ngRoute, ngAnimate
  ============================================================ */
  var app = angular.module('eventApp', ['ngRoute', 'ngAnimate']);

  /* ============================================================
     ROUTING
  ============================================================ */
  app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    // AngularJS 1.6+ changed the default hash prefix from '' to '!'.
    // Set it back to '' so nav links like href="#/events" work correctly.
    $locationProvider.hashPrefix('');

    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html',
        controller : 'LoginController'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller : 'HomeController'
      })
      .when('/events', {
        templateUrl: 'views/events.html',
        controller : 'EventController'
      })
      .when('/add-event', {
        templateUrl: 'views/add-event.html',
        controller : 'AddEventController',
        resolve: {
          adminGuard: ['$q', '$location', 'AuthService', function ($q, $location, AuthService) {
            if (AuthService.isAdmin()) { return true; }
            $location.path('/login');
            return $q.reject('not-admin');
          }]
        }
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller : 'RegisterController'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller : 'DashboardController',
        resolve: {
          adminGuard: ['$q', '$location', 'AuthService', function ($q, $location, AuthService) {
            if (AuthService.isAdmin()) { return true; }
            $location.path('/login');
            return $q.reject('not-admin');
          }]
        }
      })
      .otherwise({ redirectTo: '/home' });
  }]);

  /* ============================================================
     SHARED DATA SERVICE  (simple factory acting as data store)
  ============================================================ */
  app.factory('DataService', function () {

    var events = [
      {
        id: 1,
        name       : 'National Tech Symposium 2026',
        date       : '2026-03-25',
        category   : 'Technical',
        description: 'A premier national-level technology symposium featuring keynotes from industry leaders, paper presentations, hack competitions, and workshops on AI, Cloud & Cybersecurity.',
        icon       : '💻'
      },
      {
        id: 2,
        name       : 'Cultural Night 2026',
        date       : '2026-03-28',
        category   : 'Cultural',
        description: 'An electrifying evening celebrating arts, music, dance, drama and literary events from students across all departments. Don\'t miss the grand fashion show.',
        icon       : '🎭'
      },
      {
        id: 3,
        name       : 'Annual Sports Meet',
        date       : '2026-04-05',
        category   : 'Sports',
        description: 'Inter-departmental sports championships covering cricket, football, basketball, badminton, table tennis, athletics and many more exciting sports.',
        icon       : '⚽'
      },
      {
        id: 4,
        name       : 'Research Paper Conference',
        date       : '2026-04-12',
        category   : 'Academic',
        description: 'An academic conference inviting research papers from students and faculty across engineering, science, management and humanities disciplines.',
        icon       : '📚'
      },
      {
        id: 5,
        name       : 'Hackathon 2026',
        date       : '2026-04-18',
        category   : 'Technical',
        description: '24-hour non-stop coding marathon open to all students. Build innovative solutions to real-world problems and win exciting prizes and internship offers.',
        icon       : '🚀'
      },
      {
        id: 6,
        name       : 'Inter-College Debate',
        date       : '2026-04-22',
        category   : 'Academic',
        description: 'An intense inter-college debate competition on contemporary socio-economic and technological topics judged by distinguished faculty and alumni.',
        icon       : '🎤'
      }
    ];

    var registrations = [
      { id: 1, studentName: 'Aryan Patel',    email: 'aryan@example.com',   department: 'Computer Engineering', eventId: 1, eventName: 'National Tech Symposium 2026', timestamp: new Date('2026-03-10') },
      { id: 2, studentName: 'Priya Shah',     email: 'priya@example.com',   department: 'Information Technology', eventId: 2, eventName: 'Cultural Night 2026',         timestamp: new Date('2026-03-11') },
      { id: 3, studentName: 'Rahul Mehta',    email: 'rahul@example.com',   department: 'Mechanical Engineering', eventId: 3, eventName: 'Annual Sports Meet',           timestamp: new Date('2026-03-12') },
      { id: 4, studentName: 'Sneha Trivedi',  email: 'sneha@example.com',   department: 'Electronics Engineering', eventId: 5, eventName: 'Hackathon 2026',              timestamp: new Date('2026-03-13') },
      { id: 5, studentName: 'Karan Joshi',    email: 'karan@example.com',   department: 'Civil Engineering',      eventId: 4, eventName: 'Research Paper Conference',    timestamp: new Date('2026-03-13') }
    ];

    return {
      getEvents       : function () { return events; },
      addEvent        : function (ev) {
        ev.id   = events.length ? events[events.length - 1].id + 1 : 1;
        ev.icon = '📅';
        events.push(angular.copy(ev));
      },
      deleteEvent     : function (id) {
        var idx = events.findIndex(function (e) { return e.id === id; });
        if (idx !== -1) events.splice(idx, 1);
      },
      getRegistrations: function () { return registrations; },
      addRegistration : function (reg) {
        reg.id        = registrations.length ? registrations[registrations.length - 1].id + 1 : 1;
        reg.timestamp = new Date();
        var ev        = events.find(function (e) { return e.id === parseInt(reg.eventId); });
        reg.eventName = ev ? ev.name : 'Unknown Event';
        registrations.push(angular.copy(reg));
      },
      getUpcomingEvents: function () {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return events.filter(function (e) { return new Date(e.date) >= today; });
      }
    };
  });

  /* ============================================================
     AUTH SERVICE
  ============================================================ */
  app.factory('AuthService', function () {
    var ADMIN_USER = 'admin';
    var ADMIN_PASS = 'admin123';
    var _isAdmin   = false;

    return {
      login: function (username, password) {
        if (username === ADMIN_USER && password === ADMIN_PASS) {
          _isAdmin = true;
          return true;
        }
        return false;
      },
      logout: function () { _isAdmin = false; },
      isAdmin: function () { return _isAdmin; }
    };
  });

  /* ============================================================
     FILTERS
  ============================================================ */

  /* Filter events by search term (name or description) */
  app.filter('searchEvents', function () {
    return function (events, searchTerm) {
      if (!searchTerm) return events;
      searchTerm = searchTerm.toLowerCase();
      return events.filter(function (ev) {
        return (
          ev.name.toLowerCase().indexOf(searchTerm)        !== -1 ||
          ev.description.toLowerCase().indexOf(searchTerm) !== -1 ||
          ev.category.toLowerCase().indexOf(searchTerm)    !== -1
        );
      });
    };
  });

  /* Filter events by category */
  app.filter('categoryFilter', function () {
    return function (events, category) {
      if (!category || category === 'All') return events;
      return events.filter(function (ev) { return ev.category === category; });
    };
  });

  /* Format date nicely */
  app.filter('niceDate', function ($filter) {
    return function (dateStr) {
      return $filter('date')(new Date(dateStr), 'MMMM d, yyyy');
    };
  });

  /* Category CSS class */
  app.filter('catClass', function () {
    var map = {
      Technical: 'cat-technical',
      Cultural : 'cat-cultural',
      Sports   : 'cat-sports',
      Academic : 'cat-academic',
      Other    : 'cat-other'
    };
    return function (cat) { return map[cat] || 'cat-other'; };
  });

  /* Initials from a name */
  app.filter('initials', function () {
    return function (name) {
      if (!name) return '?';
      return name.trim().split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
    };
  });

  /* ============================================================
     MAIN CONTROLLER  (navbar-level)
  ============================================================ */
  app.controller('MainController', ['$scope', '$location', 'DataService', 'AuthService',
    function ($scope, $location, DataService, AuthService) {

      $scope.isScrolled  = false;
      $scope.totalEvents = DataService.getEvents().length;
      $scope.isActive    = function (path) { return $location.path() === path; };
      $scope.isAdmin     = function () { return AuthService.isAdmin(); };

      $scope.logout = function () {
        AuthService.logout();
        $location.path('/home');
      };

      // Keep navbar event count reactive via $watch (plain writable property)
      $scope.$watch(
        function () { return DataService.getEvents().length; },
        function (newVal) { $scope.totalEvents = newVal; }
      );

      // Scroll detection for navbar style
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', function () {
          $scope.$apply(function () {
            $scope.isScrolled = window.scrollY > 60;
          });
        });
      }
    }
  ]);

  /* ============================================================
     LOGIN CONTROLLER
  ============================================================ */
  app.controller('LoginController', ['$scope', '$location', 'AuthService',
    function ($scope, $location, AuthService) {
      // If already admin, skip login
      if (AuthService.isAdmin()) { $location.path('/dashboard'); return; }

      $scope.credentials = { username: '', password: '' };
      $scope.submitted   = false;
      $scope.errorMsg    = null;

      $scope.doLogin = function (form) {
        $scope.submitted = true;
        if (form.$invalid) { return; }
        if (AuthService.login($scope.credentials.username, $scope.credentials.password)) {
          $location.path('/dashboard');
        } else {
          $scope.errorMsg = 'Invalid username or password. Please try again.';
        }
      };
    }
  ]);

  /* ============================================================
     HOME CONTROLLER
  ============================================================ */
  app.controller('HomeController', ['$scope', 'DataService',
    function ($scope, DataService) {
      $scope.upcomingEvents    = DataService.getUpcomingEvents().slice(0, 3);
      $scope.totalEvents       = DataService.getEvents().length;
      $scope.totalRegistrations= DataService.getRegistrations().length;
      $scope.categories        = ['Technical', 'Cultural', 'Sports', 'Academic'];
    }
  ]);

  /* ============================================================
     EVENT CONTROLLER  (Events List page)
  ============================================================ */
  app.controller('EventController', ['$scope', 'DataService', '$location', 'AuthService',
    function ($scope, DataService, $location, AuthService) {
      $scope.events       = DataService.getEvents();
      $scope.searchTerm   = '';
      $scope.selectedCat  = 'All';
      $scope.categories   = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Other'];
      $scope.deleteMsg    = null;

      // Make isAdmin available to the events.html template
      $scope.isAdmin      = function () { return AuthService.isAdmin(); };

      $scope.deleteEvent  = function (id) {
        if (!AuthService.isAdmin()) {
          alert('Unauthorized: Only administrators can delete events.');
          return;
        }
        DataService.deleteEvent(id);
        $scope.events    = DataService.getEvents();
        $scope.deleteMsg = 'Event deleted successfully.';
        setTimeout(function () { $scope.$apply(function () { $scope.deleteMsg = null; }); }, 3000);
      };

      $scope.goRegister = function (ev) {
        $location.path('/register');
      };

      $scope.catClass = function (cat) {
        var map = { Technical:'cat-technical', Cultural:'cat-cultural', Sports:'cat-sports', Academic:'cat-academic', Other:'cat-other' };
        return map[cat] || 'cat-other';
      };
    }
  ]);

  /* ============================================================
     ADD EVENT CONTROLLER
  ============================================================ */
  app.controller('AddEventController', ['$scope', 'DataService',
    function ($scope, DataService) {
      $scope.categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Other'];
      $scope.newEvent   = {};
      $scope.submitted  = false;
      $scope.successMsg = null;
      $scope.errorMsg   = null;

      $scope.submitEvent = function (form) {
        $scope.submitted = true;
        if (form.$invalid) {
          $scope.errorMsg  = 'Please fix the errors below before submitting.';
          $scope.successMsg = null;
          return;
        }
        DataService.addEvent($scope.newEvent);
        $scope.successMsg = 'Event "' + $scope.newEvent.name + '" added successfully!';
        $scope.errorMsg   = null;
        $scope.newEvent   = {};
        $scope.submitted  = false;
        form.$setPristine();
        form.$setUntouched();
        setTimeout(function () { $scope.$apply(function () { $scope.successMsg = null; }); }, 5000);
      };
    }
  ]);

  /* ============================================================
     REGISTER CONTROLLER
  ============================================================ */
  app.controller('RegisterController', ['$scope', 'DataService',
    function ($scope, DataService) {
      $scope.departments = [
        'Computer Engineering',
        'Information Technology',
        'Electronics & Communication',
        'Mechanical Engineering',
        'Civil Engineering',
        'Chemical Engineering',
        'MBA / Management',
        'MCA',
        'Other'
      ];
      $scope.events      = DataService.getEvents();
      $scope.registration = {};
      $scope.submitted   = false;
      $scope.successData = null;
      $scope.errorMsg    = null;

      $scope.submitRegistration = function (form) {
        $scope.submitted = true;
        if (form.$invalid) {
          $scope.errorMsg   = 'Please fill in all required fields correctly.';
          $scope.successData = null;
          return;
        }
        var reg = angular.copy($scope.registration);
        DataService.addRegistration(reg);
        $scope.successData = {
          name      : reg.studentName,
          email     : reg.email,
          department: reg.department,
          eventName : DataService.getRegistrations().slice(-1)[0].eventName
        };
        $scope.errorMsg    = null;
        $scope.registration = {};
        $scope.submitted   = false;
        form.$setPristine();
        form.$setUntouched();
      };

      $scope.resetForm = function (form) {
        $scope.successData  = null;
        $scope.registration = {};
        $scope.submitted    = false;
        form.$setPristine();
        form.$setUntouched();
      };
    }
  ]);

  /* ============================================================
     DASHBOARD CONTROLLER
  ============================================================ */
  app.controller('DashboardController', ['$scope', 'DataService',
    function ($scope, DataService) {
      var events        = DataService.getEvents();
      var registrations = DataService.getRegistrations();
      var upcoming      = DataService.getUpcomingEvents();

      $scope.stats = {
        totalEvents       : events.length,
        totalRegistrations: registrations.length,
        upcomingCount     : upcoming.length,
        categoryCounts    : {}
      };

      // Category breakdown
      ['Technical', 'Cultural', 'Sports', 'Academic', 'Other'].forEach(function (cat) {
        $scope.stats.categoryCounts[cat] = events.filter(function (e) { return e.category === cat; }).length;
      });

      $scope.recentRegistrations = registrations.slice(-5).reverse();
      $scope.upcomingEvents      = upcoming.slice(0, 4);

      // Category breakdown items for ng-repeat in template
      $scope.categoryItems = [
        { name: 'Technical', fillClass: 'fill-primary',   color: '#8B85FF' },
        { name: 'Cultural',  fillClass: 'fill-secondary', color: '#FF6584' },
        { name: 'Sports',    fillClass: 'fill-accent',    color: '#43E97B' },
        { name: 'Academic',  fillClass: 'fill-warning',   color: '#F9C74F' },
        { name: 'Other',     fillClass: 'fill-primary',   color: '#9494B8' }
      ];

      // Progress widths (percentage of total)
      $scope.catPercent = function (cat) {
        if (!events.length) return 0;
        return Math.round(($scope.stats.categoryCounts[cat] / events.length) * 100);
      };

      // Simulate trend (static for this demo)
      $scope.trends = {
        events       : '+2 this week',
        registrations: '+5 today',
        upcoming     : 'Next 30 days',
        categories   : events.length + ' total'
      };
    }
  ]);

})();
