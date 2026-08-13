# DOST INDUSTRIES — MONETIZATION MODEL

**Document type:** Internal product and monetization strategy  

**Product:** DOST Industries  

**Status:** Active working model  

**Last reviewed:** 2026-08-13

---

## 1. Core principle

DOST Industries must support both:

- frequent professional users who benefit from a subscription;

- occasional users who want professional output without committing to a recurring plan.

The monetization model must therefore avoid forcing every paying user into a subscription.

---

## 2. FREE

### Positioning

FREE is the entry point into DOST Industries.

The goal of FREE is to:

- remove the barrier to first use;

- let professionals experience the quality of the tools;

- create trust before asking for payment;

- support organic growth and discovery;

- create a natural path toward paid use.

### Current / intended FREE access

FREE may include:

- access to basic calculator functionality;

- calculation results on screen;

- advertising where applicable;

- no recurring payment obligation.

Premium-only functionality may remain visible where useful, but must clearly indicate that an upgrade or one-time purchase is required.

---

## 3. DOST PREMIUM

### Target price

**€4.99 per month**

Final consumer pricing may need to account for:

- VAT;

- payment-provider fees;

- Apple / Google platform economics;

- regional pricing;

- future commercial decisions.

### Target user

DOST Premium is intended for professionals who use DOST Industries regularly or want the complete workflow.

Examples:

- welders;

- welding coordinators;

- IWT / IWE professionals;

- inspectors;

- QC personnel;

- supervisors;

- engineering and fabrication professionals.

### Intended Premium value

DOST Premium may include:

- no advertisements;

- saved calculations;

- unlimited Professional PDF Export;

- premium calculator functionality;

- professional workflow features;

- future Premium functionality included within the applicable subscription scope.

The exact included modules and functionality may evolve as DOST Industries grows.

---

## 4. PROFESSIONAL PDF EXPORT — ONE-TIME PURCHASE

### Principle

Users who do not want a subscription must be able to purchase a single professional PDF export.

This is intended especially for users who:

- use DOST Industries only occasionally;

- may need only one or a few reports per month;

- do not yet see enough value in a recurring subscription;

- prefer paying only when they actually need professional output.

### Working price

**€1.29 per Professional PDF Export**

This is a working launch price and may be changed before commercial release based on:

- payment-provider costs;

- VAT;

- market response;

- PDF functionality;

- report quality;

- platform fees;

- conversion data.

### Intended customer experience

Example flow:

1. User completes a calculation.

2. Result is available on screen.

3. User selects `Export Professional PDF`.

4. If the user has DOST Premium, export proceeds without an additional charge.

5. If the user does not have DOST Premium, the user is offered:

   - one Professional PDF Export for €1.29;

   - or DOST Premium for €4.99/month.

6. After successful one-time payment, one PDF export becomes available.

7. The export right is consumed when the PDF is successfully generated.

---

## 5. ACCOUNT REQUIREMENT FOR PAID EXPORT

A free DOST account should normally be required before a one-time Professional PDF Export can be purchased.

Reasons:

- associate the purchase with the correct user;

- prevent duplicate or lost purchase state;

- support purchase validation;

- support customer service;

- support legitimate restoration where technically applicable;

- provide a clear transition from anonymous/free user to paying user;

- allow later Premium conversion.

The registration step should remain as frictionless as reasonably possible.

---

## 6. PREMIUM VERSUS PAY-PER-EXPORT

The two payment models must complement rather than undermine each other.

### Occasional user

Example:

- 1 export in a month: €1.29

- no recurring commitment

- user pays only when value is received

### Regular user

At several exports per month, DOST Premium should become the clearly better-value option.

Example working comparison:

- 1 PDF: €1.29

- 2 PDFs: €2.58

- 3 PDFs: €3.87

- 4 PDFs: €5.16

At approximately four paid exports per month, a €4.99 Premium subscription already becomes economically more attractive even before considering:

- unlimited exports;

- calculation storage;

- no advertisements;

- Premium calculator features.

This creates a natural upgrade incentive without artificially blocking occasional users.

---

## 7. TRUST AND CONVERSION STRATEGY

The pay-per-export option is also a trust-building mechanism.

The intended funnel is:

`FREE USER`

→ uses calculator

→ receives useful result

→ needs professional PDF

→ purchases first one-time export

→ experiences paid DOST quality

→ returns later

→ makes additional one-time purchase

→ recognises recurring value

→ upgrades to DOST Premium

This means one-time purchases are not viewed as competition to Premium.

They are a lower-friction paid entry point into the DOST ecosystem.

---

## 8. NO CREDIT BUNDLES AT INITIAL LAUNCH

The initial model should remain simple.

Do not launch immediately with:

- 5-PDF bundles;

- 10-PDF bundles;

- prepaid wallets;

- complicated credit packages.

Initial commercial options:

1. FREE

2. €1.29 Professional PDF Export

3. €4.99/month DOST Premium

Credit bundles can be considered later if real usage data shows a meaningful customer group between occasional and subscription users.

---

## 9. PAYMENT ARCHITECTURE

Payment logic must remain provider-independent.

DOST application logic should determine access through internal purchase / entitlement state rather than directly coupling feature logic to PayPal, Apple or Google.

### Subscription example

Premium access may grant entitlements such as:

- `heat-input-premium`

- `remove-ads`

- `save-calculations`

- `pdf-export`

### One-time export example

A one-time purchase should create a consumable export right or equivalent validated purchase state.

Possible future concept:

`pdf-export-credit`

The exact implementation may differ, but the architecture must support:

- one-time purchase;

- validation;

- consumption;

- prevention of duplicate consumption;

- transaction traceability;

- Premium bypass;

- provider-independent business logic.

---

## 10. WEB / PWA

For web and PWA distribution, DOST Industries may use an appropriate web payment provider.

The final provider must be selected and integrated before commercial launch.

The payment implementation must support:

- subscriptions;

- one-time Professional PDF Export payments;

- server-side validation;

- successful-payment state;

- failed-payment handling;

- cancellation handling;

- refund considerations;

- account association;

- secure provider callbacks / verification where applicable.

The commercial and legal documentation must be updated once the final provider and exact payment flow are known.

---

## 11. APPLE APP STORE

If DOST Industries is distributed as a native iOS application, digital functionality and digital consumable purchases may need to use Apple's applicable in-app purchase system.

The architecture should therefore support:

- recurring Premium subscriptions;

- one-time / consumable PDF export purchases;

- Apple purchase validation;

- restoration where applicable;

- provider-specific purchase identifiers;

- common internal DOST entitlement logic.

Apple-specific commercial rules must be reviewed before native iOS release.

---

## 12. GOOGLE PLAY

If DOST Industries is distributed through Google Play, digital products may need to use Google Play Billing under the applicable platform rules.

The architecture should support:

- Premium subscription products;

- one-time PDF export products;

- Google purchase validation;

- provider-specific purchase identifiers;

- common internal DOST entitlement logic.

Google-specific commercial rules must be reviewed before native Android release.

---

## 13. PROFESSIONAL PDF VALUE

The paid PDF should deliver clear professional value rather than merely reproducing the calculation screen.

Potential report value may include:

- DOST Industries branding;

- calculation date and time;

- calculator/module name;

- all relevant input values;

- calculated result;

- units;

- applied process or efficiency information;

- project reference where available;

- customer/company information where applicable;

- user-entered notes;

- technical disclaimer;

- document/report identifier;

- future verification/signature fields where useful.

The final PDF Engine determines which elements are included.

A one-time export price is easier to justify when the output is suitable for real professional documentation.

---

## 14. FAILED EXPORT PROTECTION

A user must not lose a paid export credit because of a technical failure before the PDF is successfully generated.

Consumption should therefore occur only when the system has reasonable confirmation that the requested paid export was generated successfully.

The implementation should account for:

- generation failure;

- server errors;

- payment succeeded but export failed;

- repeated requests;

- duplicate browser submissions;

- retry behaviour.

---

## 15. PURCHASE RECORDS

The system should retain only the purchase information necessary for:

- validation;

- entitlement or credit management;

- customer support;

- fraud prevention;

- financial/accounting obligations;

- legally required recordkeeping.

The exact data model and retention period must be finalised with the real payment provider before commercial launch.

---

## 16. REFUNDS

Refund behaviour must be defined before commercial activation.

Important distinction:

### Subscription

Refund and cancellation handling may depend on:

- payment provider;

- platform rules;

- consumer law;

- subscription period;

- whether service delivery has begun.

### One-time PDF Export

A refund policy must account for:

- payment completed but export technically failed;

- duplicate purchase;

- export credit not consumed;

- export successfully generated and delivered;

- mandatory consumer rights.

The final Terms of Use must reflect the actual commercial implementation.

---

## 17. ADS AND PAID USERS

FREE users may see advertisements once advertising is activated.

Intended model:

### FREE

- ads may be shown;

- basic functionality available.

### One-time PDF customer

Purchasing a single PDF does not automatically create permanent ad-free access.

### DOST Premium

- no advertisements while qualifying Premium access is active.

This creates another ongoing value advantage for Premium.

---

## 18. PRICING PRINCIPLES

DOST pricing should remain:

- easy to understand;

- low-friction;

- professionally credible;

- affordable relative to the value of professional labour;

- scalable internationally;

- simple enough to explain in seconds.

Initial intended structure:

| Access | Working price | Primary value |

|---|---:|---|

| FREE | €0 | Basic calculator use |

| Professional PDF Export | €1.29 each | One professional report without subscription |

| DOST Premium | €4.99/month | Unlimited exports + storage + no ads + Premium functionality |

Prices are working commercial targets until launch pricing is formally approved.

---

## 19. FUTURE COMMERCIAL OPTIONS

Potential future options may include:

- annual Premium subscription;

- business/team subscriptions;

- enterprise licensing;

- organisation billing;

- per-module Premium access;

- additional DOST Core / Pro tiers;

- export bundles;

- professional report packs;

- education/training licences.

These are not part of the initial commercial offer unless separately approved.

---

## 20. METRICS TO TRACK AFTER LAUNCH

After payment functionality is live, DOST Industries should measure:

- FREE to account conversion;

- account to first paid export conversion;

- number of one-time PDF customers;

- repeat one-time export purchases;

- average exports per paying user;

- PDF customer to Premium conversion;

- Premium churn;

- Premium retention;

- failed payment rate;

- failed PDF generation rate;

- revenue per active user;

- relative revenue from subscription versus one-time purchases.

These metrics should guide future pricing decisions rather than assumptions alone.

---

## 21. CURRENT COMMERCIAL MODEL

The current intended first commercial structure is:

### FREE

Basic professional calculator access with advertising where activated.

### PAY PER USE

**Professional PDF Export — €1.29 per successful export**

No subscription required.

Free registered account required.

### DOST PREMIUM

**€4.99 per month**

Intended benefits:

- unlimited Professional PDF Exports;

- saved calculations;

- no advertisements;

- Premium calculator functionality;

- additional Premium workflow value as the platform develops.

---

## 22. PRE-LAUNCH REQUIREMENTS

Before one-time PDF payments or Premium are commercially activated:

- select final web payment provider;

- implement server-side purchase validation;

- implement one-time export-credit handling;

- implement Premium subscription validation;

- test successful and failed payments;

- test duplicate requests;

- test export failure without credit loss;

- test account deletion with payment-linked data;

- define refund handling;

- verify VAT/accounting treatment;

- update GDPR Processing Register;

- update Privacy Policy;

- update Terms of Use;

- perform final LEG-006 legal review.

---

END OF MONETIZATION MODEL