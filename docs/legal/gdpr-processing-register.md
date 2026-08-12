# DOST INDUSTRIES — GDPR PROCESSING REGISTER

**Document type:** Internal GDPR / AVG processing register  

**Controller:** Dost Industries B.V.  

**Trade name:** Dost Industries  

**Address:** Veckdijk 42, 3237 LV Vierpolders, The Netherlands  

**KvK:** 90713052  

**VAT:** NL865425322B01  

**Privacy contact:** [info@dostindustries.com](mailto:info@dostindustries.com)  

**Document owner:** Dost Industries B.V.  

**Review status:** Active working register  

**Last reviewed:** 2026-08-12

---

## 1. Purpose of this register

This document records the personal-data processing activities performed by Dost Industries in connection with the DOST Industries application and related services.

The register is intended to support compliance with the General Data Protection Regulation (GDPR / AVG), including:

- lawfulness, fairness and transparency;

- purpose limitation;

- data minimisation;

- accuracy;

- storage limitation;

- integrity and confidentiality;

- accountability;

- data-subject rights;

- processor management;

- international-transfer oversight.

This register must be updated whenever a new module, provider, processing purpose, data category or international data flow is introduced.

---

## 2. Roles

### 2.1 Data controller

Dost Industries B.V. is the controller for personal data processed for:

- user-account management;

- access control;

- application functionality;

- saved calculations;

- subscription and entitlement administration;

- application security;

- customer support;

- legal and compliance administration;

- future product analytics where activated;

- future communications where activated.

### 2.2 Processors and service providers

Current and planned processors are recorded separately in Section 10.

A provider marked **PLANNED / INACTIVE** is not considered an active processing activity until the corresponding service is enabled in production.

---

## 3. Categories of data subjects

Current or anticipated data subjects include:

- registered users;

- prospective users;

- customers;

- employees of customer organisations;

- administrators of future business/team accounts;

- support contacts;

- persons named in uploaded project information;

- persons named in future reports, certificates or technical documents;

- website/application visitors where technical logs or future analytics apply.

---

## 4. Categories of personal data

Depending on the feature used, Dost Industries may process:

### Account data

- Firebase user ID;

- name;

- email address;

- email verification status;

- authentication metadata;

- account role;

- company identifier where applicable.

### Subscription and access data

- entitlement identifiers;

- subscription identifier;

- subscription status;

- subscription update timestamps;

- future payment-provider references;

- future purchase or transaction identifiers.

### Technical and security data

- IP address during authentication/security processing;

- user-agent and authentication security metadata processed by Firebase Authentication;

- pseudonymous login-attempt identifier;

- failed-login count;

- failed-login timestamps;

- temporary lockout information;

- application/server error category.

### Application data

- saved calculation inputs;

- calculation results;

- module identifier;

- calculation timestamps;

- future project data;

- future project number;

- future customer/company name;

- future location information;

- future technical work data.

### Future uploaded data

Where future modules are activated:

- photos and camera images;

- standards or technical documents uploaded by users;

- certificates;

- PDFs;

- reports;

- inspection information;

- project documentation;

- user-supplied technical files.

### Future communications data

Where activated:

- support messages;

- email communication;

- notification preferences;

- notification delivery data.

### Future analytics and diagnostics data

Only if explicitly activated:

- usage events;

- device/browser information;

- application performance information;

- crash information;

- pseudonymous analytics identifiers.

---

## 5. Processing activity — User registration and authentication

**Status:** ACTIVE

### Purpose

- create and manage user accounts;

- authenticate users;

- verify email addresses;

- enable password reset;

- protect accounts against unauthorised access.

### Data subjects

- registered users;

- users attempting to register or log in.

### Personal data

- Firebase UID;

- email address;

- password credentials processed by Firebase Authentication;

- email-verification status;

- IP address and user-agent information processed by Firebase Authentication;

- authentication tokens and authentication metadata.

### Legal basis

Primary basis:

- GDPR Article 6(1)(b): processing necessary to provide the requested account and application service.

Security-related authentication processing may additionally rely on:

- GDPR Article 6(1)(f): legitimate interest in preventing abuse, fraud and unauthorised access.

### Systems / recipients

- Firebase Authentication / Google.

### Storage / processing location

Firebase Authentication is operated from United States data centres.

International transfer safeguards and applicable Google contractual mechanisms must therefore remain documented and reviewed.

### Retention

- account information is retained while the account exists;

- authentication information is deleted when the Firebase user is deleted, subject to Google's own backup and deletion lifecycle;

- Firebase may retain authentication security logs, including IP-address information, for its documented security-retention period.

### Deletion

The DOST account deletion flow deletes the Firebase Authentication user through the Firebase Admin SDK after application data is removed.

---

## 6. Processing activity — User profile and access administration

**Status:** ACTIVE

### Purpose

- store application profile information;

- determine authorised access;

- store entitlement status;

- store subscription state;

- support future business/team access controls.

### Data subjects

- registered users.

### Personal data

Currently:

- uid;

- name;

- email;

- entitlements;

- subscription state;

- role;

- companyId where applicable;

- account creation timestamp.

### Legal basis

- GDPR Article 6(1)(b): performance of the application service.

- GDPR Article 6(1)(f): legitimate interest in secure access management where applicable.

### System

Cloud Firestore.

### Firestore path

`users/{uid}`

### Storage location

Cloud Firestore database:

`europe-west4`

Region:

Netherlands / European Union.

### Retention

Until:

- account deletion;

- or earlier deletion where no longer necessary;

- subject to legal obligations that may require limited retention of separate records.

### Deletion

Account deletion recursively removes the user's Firestore document and all nested user data before deletion of the Firebase Authentication user.

---

## 7. Processing activity — Saved calculations

**Status:** ACTIVE FOR ENTITLED USERS

### Purpose

Allow authorised users to:

- save technical calculations;

- view calculation history;

- reuse technical results;

- delete individual saved calculations.

### Data subjects

- registered users with the relevant entitlement.

### Personal data

A saved calculation may include:

- uid association through the Firestore document path;

- module identifier;

- calculation inputs;

- calculation result;

- timestamps;

- technical process information.

Current Heat Input calculations may contain technical welding information but ordinarily do not require directly identifying personal information.

Future modules may result in saved calculation records containing project-related personal or business information.

### Legal basis

- GDPR Article 6(1)(b): provision of the requested saved-calculation service.

### Firestore path

`users/{uid}/calculations/{calculationId}`

### Storage location

Cloud Firestore:

`europe-west4` — Netherlands / EU.

### Retention

Until the earliest of:

- individual calculation deletion by the user;

- account deletion;

- product-level deletion rules introduced for a future module;

- data no longer being necessary for the service.

### Deletion

- individual calculations can be deleted by the user;

- account deletion recursively deletes all calculations belonging to that account.

---

## 8. Processing activity — Login abuse prevention

**Status:** ACTIVE

### Purpose

- prevent brute-force login attempts;

- reduce credential abuse;

- temporarily rate-limit repeated failed login attempts;

- protect user accounts and Dost Industries systems.

### Data subjects

- persons attempting to log in.

### Personal data

The application does not store the raw email address or raw IP address in the `login_attempts` collection.

Instead it stores a deterministic SHA-256 identifier derived from:

`IP address + normalised email address`

Associated security data:

- failed-attempt count;

- first-attempt timestamp;

- last-attempt timestamp;

- temporary blocked-until timestamp.

The resulting identifier must still be treated as pseudonymous personal data.

### Legal basis

GDPR Article 6(1)(f):

legitimate interest in application security, fraud prevention and protection against unauthorised access.

### Firestore collection

`login_attempts`

### Storage location

Cloud Firestore:

`europe-west4` — Netherlands / EU.

### Retention

Target maximum operational retention:

**24 hours after the last failed login attempt.**

Implementation:

- expired records are deleted when encountered;

- application-triggered cleanup removes records older than 24 hours;

- successful authentication clears the matching current security record.

Because paid Firestore TTL is not enabled, deletion does not necessarily occur at the exact second the 24-hour period expires. Records are removed by application cleanup upon subsequent login-security activity.

This limitation must be reconsidered if login volume, threat profile or compliance requirements materially change.

### Data minimisation

Raw email addresses and IP addresses are deliberately not persisted in this application security collection.

---

## 9. Processing activity — Server-side operational logging

**Status:** ACTIVE

### Purpose

- diagnose server failures;

- detect technical malfunction;

- support application security and availability.

### Data

Server-side application logging is intentionally minimised.

The current DOST server routes log:

- fixed internal error labels;

- safe error names/categories.

They do not intentionally log:

- authentication bearer tokens;

- passwords;

- complete request bodies;

- full Firebase error objects;

- email addresses;

- UIDs;

- IP addresses.

### Recipients

Operational hosting/logging infrastructure may include Vercel.

### Legal basis

GDPR Article 6(1)(f):

legitimate interest in maintaining a secure, reliable application.

### Retention

Subject to the configured Vercel logging retention and applicable plan settings.

This retention setting must be reviewed whenever the hosting plan or logging configuration changes.

---

## 10. Processor and provider register

### 10.1 Google / Firebase Authentication

**Status:** ACTIVE

**Role:** Processor / service provider

**Purpose:**

- account creation;

- authentication;

- password handling;

- email verification;

- password reset;

- authentication security.

**Relevant personal data:**

- email;

- passwords/credentials;

- uid;

- IP address;

- user agent;

- authentication metadata.

**Processing location:**

Firebase Authentication operates from US data centres.

**International transfer:**

YES.

Applicable Google contractual and transfer safeguards must remain under review.

**Contract / privacy documentation:**

Google/Firebase data processing and privacy documentation applies.

---

### 10.2 Google Cloud Firestore

**Status:** ACTIVE

**Role:** Processor / service provider

**Purpose:**

- user profile storage;

- entitlement storage;

- subscription-state storage;

- saved calculations;

- temporary login-security records.

**Region:**

`europe-west4`

**Region description:**

Netherlands.

**International transfer note:**

The configured database location is in the EU.

This must not be interpreted as a guarantee that every aspect of Google's service administration, support or global infrastructure processing is exclusively limited to the Netherlands.

Google's applicable data-processing and international-transfer terms remain relevant.

---

### 10.3 Vercel

**Status:** ACTIVE

**Role:** Hosting / infrastructure processor or service provider.

**Purpose:**

- serve the DOST Industries web application;

- execute Next.js server routes;

- provide deployment infrastructure;

- provide operational logging and related infrastructure services.

**Configured server function region:**

`dub1`

Dublin, Ireland / EU.

**Important limitation:**

The configured function runtime region does not by itself establish that all Vercel processing, metadata, logging, support or control-plane processing remains exclusively within the EU.

Vercel's current Data Processing Addendum and subprocessor information must therefore remain part of the compliance review.

---

### 10.4 Google AdSense

**Status:** PLANNED / INACTIVE

No production advertising processing may be recorded as active until actual AdSense identifiers and advertising functionality are enabled.

Before activation:

- update this processing register;

- verify the Privacy Policy;

- implement required consent management;

- use a Google-certified consent management platform where required for EEA/UK/Swiss advertising;

- document cookies/device identifiers and advertising purposes;

- document retention and transfer mechanisms.

---

### 10.5 PayPal

**Status:** PLANNED / INACTIVE

Current code contains architecture/placeholders for purchase validation but no live PayPal payment integration.

Before activation:

- record PayPal as an active recipient/provider;

- document payment data categories;

- document legal basis;

- document international transfer implications;

- verify Privacy Policy and Terms;

- document transaction retention requirements.

---

### 10.6 Apple App Store / Google Play Billing

**Status:** PLANNED / INACTIVE

To be assessed before native-app billing is activated.

---

### 10.7 Analytics provider

**Status:** PLANNED / INACTIVE

No analytics provider is currently recorded as active.

A Firebase `measurementId` configuration value alone does not constitute active analytics processing where Firebase Analytics is not initialised.

Before analytics activation:

- select provider;

- determine consent requirements;

- document identifiers/events;

- define retention;

- update Privacy Policy;

- implement consent controls where required;

- assess international transfers.

---

### 10.8 Crash/error reporting provider

**Status:** PLANNED / INACTIVE

No dedicated external crash-reporting provider is currently recorded as active.

Before activation:

- assess whether crash payloads may contain user input or identifiers;

- minimise payloads;

- define retention;

- document processor and transfers;

- update Privacy Policy.

---

### 10.9 AI provider

**Status:** FUTURE / INACTIVE

No external AI provider is currently recorded as active for user-data processing.

Before any AI assistant processes user content:

- select and contract the AI provider;

- determine controller/processor roles;

- prohibit unnecessary model training on customer content where commercially and technically possible;

- define retention;

- define prompt/document handling;

- document international transfers;

- assess sensitive/confidential technical information;

- update Privacy Policy and Terms;

- conduct a DPIA screening before production activation.

---

## 11. International transfers

Current known international-transfer exposure includes Firebase Authentication because Google documents that Firebase Authentication operates from US data centres.

Where personal data is transferred outside the EEA, Dost Industries must ensure that an applicable GDPR Chapter V transfer mechanism exists.

Potential mechanisms may include, depending on provider and circumstances:

- adequacy decision;

- EU-U.S. Data Privacy Framework where applicable;

- Standard Contractual Clauses;

- supplementary measures where required.

Transfer mechanisms must not be assumed indefinitely.

They must be reviewed when:

- provider terms change;

- the legal framework changes;

- a new provider is activated;

- a new processing region is introduced.

---

## 12. Retention schedule

### Firebase Authentication account

Retention:

While account remains active.

Deletion trigger:

Account deletion.

Provider-side residual/back-up deletion is subject to Google's documented deletion lifecycle.

---

### User profile

Path:

`users/{uid}`

Retention:

While account remains active.

Deletion trigger:

Account deletion.

---

### Saved calculations

Path:

`users/{uid}/calculations/{calculationId}`

Retention:

Until manually deleted by user or account deletion.

Future modules may define shorter module-specific retention where necessary.

---

### Login security records

Collection:

`login_attempts`

Retention target:

24 hours after last failed login attempt.

Deletion:

Application-triggered cleanup and successful-login cleanup.

---

### Server operational logs

Retention:

According to current hosting-provider configuration and plan.

Required control:

Review Vercel log retention before commercial launch and after plan/configuration changes.

---

### Support correspondence

Status:

Future / as applicable.

Provisional retention rule:

Only as long as necessary to resolve the matter and meet legitimate legal/business recordkeeping requirements.

A definitive retention period must be set when structured support tooling is introduced.

---

### Payment/financial records

Status:

Future.

Retention:

To be determined according to applicable Dutch tax/accounting obligations and payment-provider requirements before payment processing goes live.

Payment records required by law must not automatically be deleted solely because an application account is deleted.

---

## 13. Data-subject rights

Dost Industries must support applicable rights including:

- access;

- rectification;

- erasure;

- restriction;

- objection;

- portability where applicable;

- withdrawal of consent where processing is consent-based;

- complaint with a competent supervisory authority.

Privacy contact:

`info@dostindustries.com`

### Current technical implementation

Self-service account deletion is implemented.

The deletion flow:

1. requires an authenticated and email-verified user;

2. requires password reauthentication;

3. requires explicit `DELETE` confirmation;

4. obtains a fresh Firebase ID token;

5. verifies authentication server-side;

6. recursively deletes `users/{uid}` and nested data;

7. deletes the Firebase Authentication account.

### Data access / portability

No dedicated self-service data-export interface is currently active.

Until such functionality is implemented, qualifying requests can be handled manually through the privacy contact address.

A self-service export function should be reassessed when the volume or complexity of stored user/project data increases.

---

## 14. Security controls

Current controls include:

- HTTPS/TLS through production infrastructure;

- Firebase Authentication;

- verified email requirements for protected account functionality;

- password reauthentication for destructive account deletion;

- server-side Firebase ID-token verification;

- Firestore security rules;

- role and entitlement checks;

- server-only Firebase Admin credentials;

- environment-variable separation;

- source-control exclusion of secrets;

- brute-force login rate limiting;

- pseudonymised login-security identifiers;

- limited login-security retention;

- recursive account-data deletion;

- minimised server-side error logging;

- security headers through Next.js configuration;

- production build/type/lint verification.

Security controls must be reassessed when:

- file uploads are introduced;

- business/team accounts are introduced;

- AI processing is introduced;

- payment processing goes live;

- administrator functionality expands;

- external APIs receive user content.

---

## 15. Data minimisation rules

DOST Industries follows these implementation rules:

1. Do not collect personal data merely because it may be useful later.

2. Do not store raw authentication passwords in application databases.

3. Do not persist raw IP/email combinations for application login rate limiting.

4. Do not log bearer tokens.

5. Do not log passwords.

6. Do not log complete request bodies containing user information unless specifically required and formally reviewed.

7. Do not send user content to a third party before that processing is documented.

8. Future uploads must be limited to information required for the chosen feature.

9. Future analytics must use the minimum event/user information necessary.

10. Test accounts and production accounts must be treated as real personal data when they contain real identifiers.

---

## 16. Privacy by design requirements for future modules

Every new DOST module must answer the following before production release:

- Does the module collect personal data?

- Does it create a new data category?

- Does it create a new processing purpose?

- Does it send data to another provider?

- Does it store data outside `users/{uid}`?

- Does it use camera/photos?

- Does it use location?

- Does it process customer/project/person names?

- Does it upload files?

- Does it create downloadable reports?

- Does it introduce AI?

- Does it introduce analytics or tracking?

- Does it require consent?

- Does it involve an international transfer?

- What is the retention period?

- How is the data deleted?

- Does account deletion remove it?

- Does the Privacy Policy require amendment?

- Does this register require amendment?

- Is a DPIA screening required?

No new personal-data processing should be treated as production-ready until these questions are resolved.

---

## 17. DPIA screening

A formal Data Protection Impact Assessment is not automatically assumed necessary for the current calculator/account MVP.

A DPIA screening must be repeated before activating functionality involving, for example:

- systematic large-scale monitoring;

- extensive location tracking;

- sensitive personal data;

- automated decisions producing significant effects;

- large-scale employee/personnel monitoring;

- AI analysis of significant personal or confidential content;

- large-scale image or camera processing;

- high-risk inspection/person-identification workflows.

If the screening indicates likely high risk to individuals, a DPIA must be performed before that processing begins.

---

## 18. Data breach handling

Dost Industries must maintain the ability to:

- identify a suspected personal-data breach;

- contain the breach;

- establish affected systems and data;

- document the incident;

- assess risk to individuals;

- determine whether notification to the competent supervisory authority is required;

- determine whether affected individuals must be informed;

- preserve a breach register.

No breach notification should be delayed merely because all technical facts are not yet known.

---

## 19. Processor review obligations

At least periodically and whenever a material provider change occurs, Dost Industries must review:

- current DPA;

- privacy/security documentation;

- subprocessor list;

- transfer mechanism;

- data location options;

- retention settings;

- security settings;

- service configuration.

Active providers currently requiring review:

- Google / Firebase;

- Vercel.

Planned providers must be reviewed before activation.

---

## 20. Current GDPR implementation status

### Completed

- bilingual Privacy Policy;

- bilingual Terms of Use;

- bilingual Technical Disclaimer;

- Firestore database located in `europe-west4`;

- Vercel function region moved to `dub1`;

- application-side login-attempt retention introduced;

- raw login IP/email combination not persisted;

- recursive user-data deletion implemented;

- Firebase Auth user deletion implemented;

- destructive account deletion protected by reauthentication;

- server-side logging minimised;

- production typecheck passed;

- production lint passed;

- production build passed.

### Still to complete or review

- LEG-005 Account Deletion Policy;

- LEG-006 Legal Review;

- final processor/DPA review before commercial launch;

- confirm Vercel logging retention configuration;

- document actual payment provider before activation;

- implement/update CMP before advertising activation;

- document actual analytics provider before activation;

- document actual crash-reporting provider before activation;

- conduct AI privacy review before AI activation;

- reassess self-service data export as stored user data expands;

- repeat GDPR review when file uploads/projects/business accounts are introduced.

---

## 21. Change-control rule

This register must be reviewed whenever any of the following occurs:

- a new module is released;

- a new personal-data field is stored;

- a new Firestore collection is introduced;

- a new external provider receives user data;

- data location changes;

- hosting configuration changes;

- retention changes;

- payment processing goes live;

- advertising goes live;

- analytics goes live;

- file uploads go live;

- AI functionality goes live;

- team/business accounts go live;

- account deletion architecture changes;

- relevant privacy law or provider terms materially change.

---

## 22. Internal approval record

**Current implementation owner:** Dost Industries B.V.

**Technical review:** Pending final LEG-004 completion.

**Legal review:** LEG-006 pending.

**Commercial production approval:** Pending completion of remaining legal launch controls.

---

END OF REGISTER