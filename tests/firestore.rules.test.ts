import { readFileSync } from "node:fs";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  test,
} from "vitest";

let testEnv: RulesTestEnvironment;

const PROJECT_ID = "dost-industries-security-tests";

function validUserProfile(
  uid: string,
  email: string
) {
  return {
    uid,
    name: "Test User",
    email,
    role: "USER",
    entitlements: [],
    subscription: null,
    companyId: null,
    createdAt: serverTimestamp(),
  };
}

function premiumUserProfile(
  uid: string,
  email: string
) {
  return {
    ...validUserProfile(uid, email),
    entitlements: [
      "save-calculations",
    ],
  };
}

function validCalculation() {
  return {
    moduleId: "heat-input",
    inputs: {
      voltage: 24,
      amperage: 220,
      speed: 300,
      efficiency: 0.8,
    },
    result: {
      heatInput: 0.84,
      unit: "kJ/mm",
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync(
        "firestore.rules",
        "utf8"
      ),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe(
  "Firestore user-profile security rules",
  () => {
    test(
      "an unauthenticated visitor cannot read a profile",
      async () => {
        const db =
          testEnv
            .unauthenticatedContext()
            .firestore();

        await assertFails(
          getDoc(
            doc(db, "users", "user-one")
          )
        );
      }
    );

    test(
      "a user can create their own valid free profile",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertSucceeds(
          setDoc(
            doc(db, "users", uid),
            validUserProfile(uid, email)
          )
        );
      }
    );

    test(
      "a user cannot create another user's profile",
      async () => {
        const db =
          testEnv
            .authenticatedContext(
              "user-one",
              {
                email:
                  "user-one@example.com",
              }
            )
            .firestore();

        await assertFails(
          setDoc(
            doc(
              db,
              "users",
              "user-two"
            ),
            validUserProfile(
              "user-two",
              "user-two@example.com"
            )
          )
        );
      }
    );

    test(
      "a user cannot register with an elevated role",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(db, "users", uid),
            {
              ...validUserProfile(
                uid,
                email
              ),
              role: "ADMIN",
            }
          )
        );
      }
    );

    test(
      "a user cannot register with remove-ads entitlement",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(db, "users", uid),
            {
              ...validUserProfile(
                uid,
                email
              ),
              entitlements: [
                "remove-ads",
              ],
            }
          )
        );
      }
    );

    test(
      "a user cannot register with save-calculations entitlement",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(db, "users", uid),
            {
              ...validUserProfile(
                uid,
                email
              ),
              entitlements: [
                "save-calculations",
              ],
            }
          )
        );
      }
    );

    test(
      "a user cannot register with pdf-export entitlement",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(db, "users", uid),
            {
              ...validUserProfile(
                uid,
                email
              ),
              entitlements: [
                "pdf-export",
              ],
            }
          )
        );
      }
    );

    test(
      "a user cannot register with heat-input-premium entitlement",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(db, "users", uid),
            {
              ...validUserProfile(
                uid,
                email
              ),
              entitlements: [
                "heat-input-premium",
              ],
            }
          )
        );
      }
    );

    test(
      "a user can read their own profile",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                validUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertSucceeds(
          getDoc(
            doc(db, "users", uid)
          )
        );
      }
    );

    test(
      "a user cannot read another user's profile",
      async () => {
        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  "user-two"
                ),
                validUserProfile(
                  "user-two",
                  "user-two@example.com"
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(
              "user-one",
              {
                email:
                  "user-one@example.com",
              }
            )
            .firestore();

        await assertFails(
          getDoc(
            doc(
              db,
              "users",
              "user-two"
            )
          )
        );
      }
    );

    test(
      "a user cannot update their own profile from the browser",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                validUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          updateDoc(
            doc(db, "users", uid),
            {
              name: "Changed Name",
            }
          )
        );
      }
    );

    test(
      "a user cannot grant themselves an entitlement",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                validUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          updateDoc(
            doc(db, "users", uid),
            {
              entitlements: [
                "remove-ads",
              ],
            }
          )
        );
      }
    );

    test(
      "a user can delete their own profile",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                validUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertSucceeds(
          deleteDoc(
            doc(db, "users", uid)
          )
        );
      }
    );

    test(
      "a user cannot delete another user's profile",
      async () => {
        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  "user-two"
                ),
                validUserProfile(
                  "user-two",
                  "user-two@example.com"
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(
              "user-one",
              {
                email:
                  "user-one@example.com",
              }
            )
            .firestore();

        await assertFails(
          deleteDoc(
            doc(
              db,
              "users",
              "user-two"
            )
          )
        );
      }
    );

    test(
      "a user cannot register with a subscription",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(db, "users", uid),
            {
              ...validUserProfile(
                uid,
                email
              ),
              subscription: {
                id: "dost-premium",
                status: "ACTIVE",
              },
            }
          )
        );
      }
    );
  }
);

describe(
  "Firestore calculation storage security rules",
  () => {
    test(
      "a free user cannot save a calculation",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                validUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(
              db,
              "users",
              uid,
              "calculations",
              "calculation-one"
            ),
            validCalculation()
          )
        );
      }
    );

    test(
      "a user with save-calculations entitlement can save a calculation",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                premiumUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertSucceeds(
          setDoc(
            doc(
              db,
              "users",
              uid,
              "calculations",
              "calculation-one"
            ),
            validCalculation()
          )
        );
      }
    );

    test(
      "a user with save-calculations entitlement can read their own calculation",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                premiumUserProfile(
                  uid,
                  email
                )
              );

              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid,
                  "calculations",
                  "calculation-one"
                ),
                validCalculation()
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertSucceeds(
          getDoc(
            doc(
              db,
              "users",
              uid,
              "calculations",
              "calculation-one"
            )
          )
        );
      }
    );

    test(
      "a user cannot read another user's calculation",
      async () => {
        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  "user-two"
                ),
                premiumUserProfile(
                  "user-two",
                  "user-two@example.com"
                )
              );

              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  "user-two",
                  "calculations",
                  "calculation-one"
                ),
                validCalculation()
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(
              "user-one",
              {
                email:
                  "user-one@example.com",
              }
            )
            .firestore();

        await assertFails(
          getDoc(
            doc(
              db,
              "users",
              "user-two",
              "calculations",
              "calculation-one"
            )
          )
        );
      }
    );

    test(
      "a user with save-calculations entitlement can delete their own calculation",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                premiumUserProfile(
                  uid,
                  email
                )
              );

              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid,
                  "calculations",
                  "calculation-one"
                ),
                validCalculation()
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertSucceeds(
          deleteDoc(
            doc(
              db,
              "users",
              uid,
              "calculations",
              "calculation-one"
            )
          )
        );
      }
    );

    test(
      "an invalid calculation structure is rejected",
      async () => {
        const uid = "user-one";
        const email =
          "user-one@example.com";

        await testEnv
          .withSecurityRulesDisabled(
            async (context) => {
              await setDoc(
                doc(
                  context.firestore(),
                  "users",
                  uid
                ),
                premiumUserProfile(
                  uid,
                  email
                )
              );
            }
          );

        const db =
          testEnv
            .authenticatedContext(uid, {
              email,
            })
            .firestore();

        await assertFails(
          setDoc(
            doc(
              db,
              "users",
              uid,
              "calculations",
              "calculation-one"
            ),
            {
              moduleId: "heat-input",
              inputs: {
                voltage: 24,
              },
              createdAt:
                serverTimestamp(),
              updatedAt:
                serverTimestamp(),
            }
          )
        );
      }
    );
  }
);