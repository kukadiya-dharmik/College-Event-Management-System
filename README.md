# College Event Management System (CEMS)

A modern, responsive Single Page Application (SPA) built with AngularJS 1.x for managing college events, handling student registrations, and viewing dashboard statistics.

## ✨ Features
- **Public Event Browsing:** View all upcoming technical, cultural, and academic events.
- **Student Registration:** Seamlessly register for any open event.
- **Admin Dashboard:** Log in as an admin to view real-time statistics, event capacity, and recent registrations.
- **Event Management:** Admins can easily add or delete events from the platform.
- **Category Filtering & Search:** Find specific events instantly using real-time search and category filters.
- **Responsive Design:** A beautiful glassmorphism-inspired UI that works perfectly on desktop, tablet, and mobile devices.

## 📐 Key AngularJS Features Demonstrated
This project serves as a comprehensive example of an AngularJS 1.x Single Page Application. It heavily utilizes the following core features:
- **`ngRoute` ($routeProvider):** For seamless navigation between views without reloading the page.
- **`ngAnimate`:** For smooth CSS-based transitions and animations when views enter/leave or elements change state.
- **Custom Directives (`ng-app`, `ng-controller`, `ng-view`, `ng-repeat`, `ng-model`, `ng-class`, `ng-if`, `ng-show`, `ng-submit`, `ng-options`, `ng-style`):** Extensive use of built-in directives for DOM manipulation and two-way data binding.
- **Custom Services & Factories (`DataService`, `AuthService`):** For centralizing business logic, managing state (LocalStorage), and handling user authentication.
- **Custom Filters (`searchEvents`, `categoryFilter`, `niceDate`, `catClass`, `initials`):** For formatting data directly in the views (e.g., date formatting, search filtering).
- **Form Validation (`$invalid`, `$error`, `ng-minlength`, `required`):** Built-in AngularJS form validation with custom error messages.
- **Dependency Injection:** Injecting services, `$scope`, `$location`, `$filter`, and `$window` into controllers.
- **Route Guards (`resolve`):** Protecting specific routes (like `/dashboard` and `/add-event`) using the `$q` promise library so they can only be accessed by an authenticated admin.

## 🛠️ Technology Stack
- **Frontend Framework:** AngularJS 1.8.2 (`ngRoute`, `ngAnimate`)
- **Styling:** Vanilla CSS (Custom Properties, Glassmorphism) with Bootstrap 5 (for Grid & Utilities)
- **Icons:** Bootstrap Icons
- **Data Persistence:** Browser LocalStorage (No external database required)

---

## 🚀 How to Run the Project

1. Clone or download the repository to your local machine.
2. Open the project folder in your favorite code editor (like VS Code).
3. **Start a local development server** (See the vital warning below).
4. Open your browser and navigate to the localhost port provided by your server.

> **Admin Login Credentials:**
> - **Username:** `admin`
> - **Password:** `admin123`

---

## ⚠️ CRITICAL: Why You MUST Use a Local Web Server

**Do NOT just double-click `index.html` to open it in your browser.** If you open the file directly, you will see `file:///C:/path/to/project/index.html` in your address bar, and **the application will break**. 

### The Problem: CORS and the `file://` Protocol
This application is built as a Single Page Application (SPA) using **AngularJS Routing (`ngRoute`)**. 
To make the app modular, the HTML templates for different pages (Home, Events, Login, Dashboard) are split into separate files inside the `views/` folder.

When AngularJS tries to load these views (e.g., `templateUrl: 'views/home.html'`), it uses background HTTP requests (XHR). Modern web browsers have strict security policies known as **CORS (Cross-Origin Resource Sharing)**. Browsers block XHR requests made under the `file://` protocol to prevent malicious scripts from reading your local hard drive. 

If you just double-click `index.html`, AngularJS will silently fail to load the templates, and you will see a blank page or a broken layout.

### The Solution: Go Live
To fix this, the files must be served over the `http://` protocol rather than `file://`. You can easily do this in a few ways:

**Option 1: VS Code Live Server (Recommended)**
1. Install the "Live Server" extension by Ritwick Dey in VS Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.
3. It will automatically open in your browser at `http://127.0.0.1:5500/`.

**Option 2: Python HTTP Server**
If you have Python installed, open your terminal/command prompt in the project folder and run:
`python -m http.server 8000` (or `python3 -m http.server 8000`)
Then open your browser to `http://localhost:8000`.

**Option 3: Node.js (http-server)**
If you have Node.js installed, open your terminal and run:
`npx http-server`
Then open your browser to the provided `http://localhost` link.
