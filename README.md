# Vibloop

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Environment Configuration

Before running the application, set up your local environment file:

```bash
cp .env.example .env
npm run env:generate
```

This generates `src/environment.ts` and `src/assets/firebase-messaging-sw.js` (both are gitignored to keep credentials private).

## Development server


To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


| **Item / Concept**                    | **Convention**                                 | **Example**                                |
| ------------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| **Component**                         | `PascalCase` + `.component.ts`                 | `LoginFormComponent`                       |
| **Component Selector**                | `app-` + `kebab-case`                          | `app-login-form`                           |
| **Service**                           | `PascalCase` + `.service.ts`                   | `AuthService`                              |
| **Directive**                         | `PascalCase` + `.directive.ts`                 | `HighlightDirective`                       |
| **Pipe**                              | `PascalCase` + `.pipe.ts`                      | `DateFormatPipe`                           |
| **Guard**                             | `PascalCase` + `.guard.ts`                     | `AuthGuard`                                |
| **Resolver**                          | `PascalCase` + `.resolver.ts`                  | `UserDataResolver`                         |
| **Interceptor**                       | `PascalCase` + `.interceptor.ts`               | `AuthInterceptor`                          |
| **Module**                            | `PascalCase` + `.module.ts`                    | `UserProfileModule`                        |
| **Interface**                         | `PascalCase` + `.interface.ts` (no `I` prefix) | `User`                                     |
| **Model**                             | `PascalCase` + `.model.ts`                     | `UserModel`                                |
| **Enum**                              | `PascalCase` + `.enum.ts`                      | `UserRole`                                 |
| **Type Alias**                        | `PascalCase`                                   | `UserResponse`                             |
| **Constant**                          | `UPPER_SNAKE_CASE`                             | `DEFAULT_PAGE_SIZE`                        |
| **Variable**                          | `camelCase`                                    | `userName`                                 |
| **Boolean Variable**                  | start with `is`, `has`, or `can`               | `isLoggedIn`                               |
| **Private Member**                    | `camelCase` (optional `_` prefix)              | `_userList`, `authService`                 |
| **Public Member**                     | `camelCase`                                    | `userData`, `selectedId`                   |
| **Function / Method**                 | `camelCase`                                    | `getUserDetails`                           |
| **Async Function**                    | `camelCase` + `Async` suffix                   | `loadUserDataAsync`                        |
| **Observable Variable**               | `$` suffix                                     | `user$`                                    |
| **Subject / BehaviorSubject**         | `Subject` suffix                               | `userSubject`                              |
| **Combined Observable**               | `$` suffix                                     | `userWithOrders$`                          |
| **EventEmitter**                      | `verbNounEvent`                                | `userSelectedEvent`                        |
| **Getter / Setter**                   | `get` / `set` + `PascalCase`                   | `getUserName`, `setUserName`               |
| **Template Reference Variable**       | `camelCase` with `#` prefix                    | `#containerRef`                            |
| **Input Property**                    | `camelCase`                                    | `@Input() userData`                        |
| **Output Property**                   | `verbNoun` + `Change` / `Event`                | `@Output() valueChange`                    |
| **Route Path**                        | `kebab-case`                                   | `user-profile`, `event-list`               |
| **Route Parameter**                   | `camelCase`                                    | `:userId`, `:eventId`                      |
| **Query Parameter**                   | `camelCase`                                    | `?page=1&sortBy=name`                      |
| **HTTP Method Names**                 | `verbNoun` (describe action)                   | `getUserById()`, `updateProfile()`         |
| **HTTP API Endpoints**                | `kebab-case`                                   | `/api/v1/user-profile`                     |
| **Folder Names**                      | `kebab-case`                                   | `user-profile`, `auth`, `shared`           |
| **File Names**                        | `kebab-case`                                   | `user-profile.component.ts`                |
| **Test Files**                        | `.spec.ts` suffix                              | `login.component.spec.ts`                  |
| **Style Files**                       | same as component base name                    | `login-form.component.scss`                |
| **HTML Files**                        | same as component base name                    | `login-form.component.html`                |
| **Utility / Helper Files**            | `kebab-case` + `.util.ts`                      | `string.util.ts`                           |
| **Constants File**                    | `kebab-case` + `.constants.ts`                 | `app.constants.ts`                         |
| **Config File**                       | `kebab-case` + `.config.ts`                    | `app.config.ts`                            |
| **Environment File**                  | `environment.[name].ts`                        | `environment.prod.ts`                      |
| **CSS / SCSS Variables**              | `kebab-case`                                   | `$primary-color`, `$font-size-base`        |
| **Commit Message (Angular Standard)** | `type(scope): message`                         | `feat(auth): add login API integration`    |
| **RxJS Operator Functions**           | `camelCase`                                    | `map`, `filter`, `switchMap`               |
| **TrackBy Functions**                 | `trackBy<Entity>`                              | `trackByUserId`                            |
| **NgFor Local Variables**             | short & clear                                  | `let user of users`                        |
| **NgModel Variables**                 | `camelCase`                                    | `userName`, `password`                     |
| **Form Controls**                     | `camelCase`                                    | `emailControl`, `loginForm`                |
| **CSS Classes**                       | `kebab-case`                                   | `.user-card`, `.active-state`              |
| **IDs**                               | `kebab-case`                                   | `#user-card`, `#main-header`               |
| **Images / Assets**                   | `kebab-case`                                   | `user-avatar.png`, `logo-dark.svg`         |
| **Testing Describe Blocks**           | `PascalCase`                                   | `describe('AuthService', ...)`             |
| **Testing Variables**                 | `camelCase`                                    | `mockUser`, `expectedResult`               |
| **Config Constants (e.g., API URLs)** | `UPPER_SNAKE_CASE`                             | `BASE_API_URL`                             |
| **Logger Variable**                   | `camelCase`                                    | `logger`, `appLogger`                      |
| **Decorator Names**                   | `camelCase`                                    | `@Injectable`, `@Component`                |
| **Module Imports Alias**              | meaningful short name                          | `import * as userUtils from './user.util'` |
| **Error Variables**                   | `camelCase` + `Error` suffix                   | `loginError`                               |
| **Date / Time Variables**             | `camelCase` + context                          | `createdAt`, `updatedAt`                   |
| **Configuration Keys (JSON / TS)**    | `camelCase`                                    | `apiBaseUrl`, `maxRetries`                 |

## License

Copyright (c) 2026 Viblooop. All rights reserved.

This source code is made available for viewing and evaluation purposes only. No reproduction, distribution, modification, or commercial use is permitted without prior written consent. See the [LICENSE](LICENSE) file for complete terms.
