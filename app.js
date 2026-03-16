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
          adminGuard: ['$q', '$window', 'AuthService', function ($q, $window, AuthService) {
            if (AuthService.isAdmin()) { return true; }
            $window.location.href = 'login.html';
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
    
    var EVENTS_KEY = 'cems_events';
    var REGISTRATIONS_KEY = 'cems_registrations';

    // Initialize empty data in localStorage
    function initializeData() {
      if (!localStorage.getItem(EVENTS_KEY)) {
        // Add a test event for testing delete functionality
        var testEvent = [
          {
            id: 1,
            name: 'Test Event for Delete',
            date: '2026-12-25',
            category: 'Technical',
            description: 'This is a test event to verify the delete functionality works correctly.',
            icon: '🧪'
          }
        ];
        localStorage.setItem(EVENTS_KEY, JSON.stringify(testEvent));
      }

      if (!localStorage.getItem(REGISTRATIONS_KEY)) {
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([]));
      }
    }

    // Initialize data on first load
    initializeData();

    return {
      getEvents: function () {
        return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
      },
      addEvent: function (ev) {
        var events = this.getEvents();
        ev.id = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
        ev.icon = '📅';
        events.push(ev);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      },
      deleteEvent: function (id) {
        var events = this.getEvents();
        var filteredEvents = events.filter(function (e) { return e.id !== id; });
        localStorage.setItem(EVENTS_KEY, JSON.stringify(filteredEvents));
      },
      getRegistrations: function () {
        return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]');
      },
      addRegistration: function (reg) {
        var registrations = this.getRegistrations();
        var events = this.getEvents();
        reg.id = registrations.length ? Math.max(...registrations.map(r => r.id)) + 1 : 1;
        reg.timestamp = new Date();
        var ev = events.find(function (e) { return e.id === parseInt(reg.eventId); });
        reg.eventName = ev ? ev.name : 'Unknown Event';
        registrations.push(reg);
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
      },
      getUpcomingEvents: function () {
        var events = this.getEvents();
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
    var ADMIN_KEY = 'cems_admin_logged_in';

    return {
      login: function (username, password) {
        if (username === ADMIN_USER && password === ADMIN_PASS) {
          localStorage.setItem(ADMIN_KEY, 'true');
          return true;
        }
        return false;
      },
      logout: function () { 
        localStorage.removeItem(ADMIN_KEY);
      },
      isAdmin: function () { 
        return localStorage.getItem(ADMIN_KEY) === 'true';
      }
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
      $scope.isAdmin = function() {
        return AuthService.isAdmin();
      };

      $scope.goRegister = function (ev) {
        $location.path('/register');
      };

      $scope.catClass = function (cat) {
        var map = { Technical:'cat-technical', Cultural:'cat-cultural', Sports:'cat-sports', Academic:'cat-academic', Other:'cat-other' };
        return map[cat] || 'cat-other';
      };

      $scope.deleteEvent = function (id) {
        if (confirm('Are you sure you want to delete this event?')) {
          DataService.deleteEvent(id);
          $scope.events = DataService.getEvents(); // Refresh the events list
          $scope.deleteMsg = 'Event deleted successfully!';
          setTimeout(function () { 
            $scope.$apply(function () { 
              $scope.deleteMsg = null; 
            }); 
          }, 3000);
        }
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
      
      // Function to refresh all dashboard data
      function refreshDashboardData() {
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

        // Calculate real-time trends
        var today = new Date();
        var todayRegistrations = registrations.filter(function(reg) {
          var regDate = new Date(reg.timestamp);
          return regDate.toDateString() === today.toDateString();
        }).length;

        var thisWeekEvents = events.filter(function(ev) {
          var evDate = new Date(ev.date);
          var weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return evDate >= today && evDate <= weekFromNow;
        }).length;

        // Update trends with real-time data
        $scope.trends = {
          events       : '+' + thisWeekEvents + ' this week',
          registrations: '+' + todayRegistrations + ' today',
          upcoming     : upcoming.length + ' upcoming',
          categories   : events.length + ' total'
        };
      }

      // Initial data load
      refreshDashboardData();

      // Watch for changes in events and registrations
      $scope.$watch(
        function () { return DataService.getEvents().length; },
        function () { refreshDashboardData(); }
      );

      $scope.$watch(
        function () { return DataService.getRegistrations().length; },
        function () { refreshDashboardData(); }
      );

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
        var events = DataService.getEvents();
        if (!events.length) return 0;
        return Math.round(($scope.stats.categoryCounts[cat] / events.length) * 100);
      };
    }
  ]);

})();
