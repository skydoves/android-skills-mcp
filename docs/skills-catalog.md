# Skill Catalog

The current snapshot bundled in both packages contains eighteen skills from upstream `android/skills`. The catalog grows as upstream adds more.

## build

### `agp-9-upgrade`

Upgrades, or migrates, an Android project to use Android Gradle Plugin (AGP) version 9. Do not use this skill for migrating Kotlin Multiplatform (KMP) projects.

Covers the migration from older AGP versions: built in Kotlin support, BuildConfig changes, KSP/KAPT differences, the Paparazzi adjustments for Gradle 9, and the recipes for fixing common breakages.

## camera

### `camera1-to-camerax`

Migrates legacy Android camera implementations (Camera1 or raw Camera2 APIs) to CameraX, a lifecycle-aware Jetpack library built on top of Camera2 that resolves camera rotation issues and handles device dependencies.

Covers dependency setup (1.3.0+ for interop, 1.5.0+ for Compose extensions), permission handling, lifecycle binding, PreviewView integration, image capture, and the Compose extensions path.

## device-ai

### `appfunctions`

Analyzes Android apps to identify key user workflows for AppFunctions such as creating a note, playing media, or sending an automated or AI agent triggered message, voice commands, or system shortcuts, without needing to open the app UI.

Generates Kotlin code to expose these workflows to the Android system, allowing agents to discover and execute them on-device. Also refines KDoc documentation to ensure AI agents correctly understand and use the provided functionality.

## devtools

### `android-cli`

Orchestrates Android development tasks including project creation, deployment, SDK management, and environment diagnostics using the `android` command-line tool.

Covers SDK install/update/remove, project scaffolding from templates, app run/install on devices and emulators, and CLI environment diagnostics. References cover device interaction (`screen capture`, `screen resolve`, `layout`) and journey test execution.

## identity

### `verified-email`

Provides a complete workflow for implementing verified email retrieval on Android Credential Manager API. Integrate a secure, OTP-less email verification flow into an Android app.

Solves the problem of high-friction sign-up processes by leveraging cryptographically verified credentials from trusted providers like Google.

## jetpack-compose

### `adaptive`

Instructions to make or update an app's UI so it adapts to phones, tablets, foldables, laptops, desktop, TV, Auto, and XR.

Covers handling different window sizes, pointing devices (such as mouse) and text entry devices (such as keyboard) using the Compose MediaQuery API. Covers multi-pane layouts using Navigation3 Scenes, adaptive UI components (such as buttons) with varying target sizes, and adaptive layouts (including navigation areas — nav rails and nav bars) using the Compose Grid and FlexBox APIs.

### `migrate-xml-views-to-jetpack-compose`

Provides a structured workflow for migrating an Android XML View to Jetpack Compose.

Walks through ten steps: identifying the optimal candidate, project analysis, planning, capturing the baseline UI, setting up Compose dependencies, theming, layout migration, validation, replacing usages, and removing the old XML.

### `styles`

Integrates the Jetpack Compose Styles API into an Android project: upgrading dependencies, setting up component themes, making custom components styleable, and migrating existing layout properties to use unified styles.

Migrate custom design system components, replace hard coded parameters with Style attributes, and use Modifier.styleable for interaction states.

## navigation

### `navigation-3`

Learn how to install and migrate to Jetpack Navigation 3, and how to implement features and patterns such as deep links, multiple backstacks, scenes (dialogs, bottom sheets, list-detail, two-pane, supporting pane), conditional navigation (such as logged-in vs anonymous), returning results from flows, integration with Hilt, ViewModel, Kotlin, and view interoperability.

## performance

### `r8-analyzer`

Analyzes Android build files and R8 keep rules to identify redundancies, broad package-wide rules, and rules that subsume library consumer keep rules.

Use when developers want to optimize their app's size, remove redundant or overly broad keep rules, or troubleshoot Proguard configurations.

## play

### `engage-sdk-integration`

Helps developers integrate, debug, and resolve Play Engage SDK implementation issues.

Use when adding Engage SDK support, generating publishing code, mapping data classes to entities, or fixing SDK-related errors. References include vertical schemas (food, watch, listen, read, shopping, social, travel, tv, other) and common publishing patterns.

### `play-billing-library-version-upgrade`

Use this skill when upgrading or migrating an Android project from any legacy Google Play Billing Library version to the current one.

References include the full release notes, migration logic, and a version checklist.

## profilers

### `perfetto-sql`

Translates natural language data intents into syntactically valid Perfetto SQL queries and executes them against a local trace file.

Use this skill to extract slice, thread, or memory data from Android Perfetto traces using `trace_processor`.

### `perfetto-trace-analysis`

Analyzes Perfetto traces to find the root cause of latency, memory, or jank issues in Android apps.

Use when the user provides a Perfetto trace file and asks any question, ongoing investigation, or open-ended request to analyze its contents.

## system

### `edge-to-edge`

Use this skill to migrate your Jetpack Compose app to add adaptive edge to edge support and troubleshoot common issues.

Covers fixing UI components (like buttons or lists) that are obscured by or overlapping with the navigation bar or status bar, fixing IME insets, and fixing system bar legibility. This is one of the few skills in the current catalog that is fully self contained (no external references).

## testing

### `testing-setup`

Analyzes and creates a testing strategy for native Android apps: install testing libraries, set up test infrastructure, create harnesses for unit tests, UI tests, screenshot tests, and end-to-end tests.

## wear

### `jetpack-compose-m3`

Expert guidance for working with Wear OS Compose Material3. Use when creating, updating or migrating Wear OS projects.

Covers `androidx.wear.compose.material3`, `androidx.wear.compose.foundation`, and `androidx.wear.compose.navigation3`. Core components such as `AppScaffold`, `ScreenScaffold`, and `TransformingLazyColumn`. Migration from earlier versions such as Material 2.5 and Horologist.

## xr

### `display-glasses-with-jetpack-compose-glimmer`

Provides guidelines for developing projected Android XR apps for display glasses using the Jetpack Compose Glimmer UI toolkit.

Covers foundational Glimmer design principles, GlimmerTheme styling tokens (GlimmerColors, GlimmerTypography, GlimmerShapes), the Projected Activity model that runs on a host device and projects UI to connected glasses, hardware permission handling, notifications behavior, and the Glimmer component set: buttons, cards, focus, icons, text, title chips, and more.

## How to refresh

Both published packages bundle the snapshot at publish time. To use a fresher upstream than what's bundled, point the MCP server at a local clone:

```bash
git clone https://github.com/android/skills.git /tmp/skills
npx android-skills-mcp --skills-dir /tmp/skills
```

Or for the packager:

```bash
npx android-skills-pack install --target cursor --skills-dir /tmp/skills
```

The catalog auto syncs to whatever is in the directory you point at.
