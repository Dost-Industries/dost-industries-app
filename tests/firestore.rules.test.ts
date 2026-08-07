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

function validUserProfile(uid: string, email: string) {
  return {
    uid,
    name: "Test User",
    email,
    plan: "FREE",
    role: "USER",
    modules: ["heat-input"],
    companyId: null,
    createdAt: serverTimestamp(),
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore user-profile security rules", () => {
  test("an unauthenticated visitor cannot read a profile", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "users", "user-one")));
  });

  test("a user can create their own valid profile", async () => {
    const uid = "user-one";
    const email = "user-one@example.com";

    const db = testEnv
      .authenticatedContext(uid, { email })
      .firestore();

    await assertSucceeds(
      setDoc(
        doc(db, "users", uid),
        validUserProfile(uid, email)
      )
    );
  });

  test("a user cannot create another user's profile", async () => {
    const db = testEnv
      .authenticatedContext("user-one", {
        email: "user-one@example.com",
      })
      .firestore();

    await assertFails(
      setDoc(
        doc(db, "users", "user-two"),
        validUserProfile(
          "user-two",
          "user-two@example.com"
        )
      )
    );
  });

  test("a user cannot register with an elevated role", async () => {
    const uid = "user-one";
    const email = "user-one@example.com";

    const db = testEnv
      .authenticatedContext(uid, { email })
      .firestore();

    await assertFails(
      setDoc(doc(db, "users", uid), {
        ...validUserProfile(uid, email),
        role: "ADMIN",
      })
    );
  });

  test("a user cannot register with a paid plan", async () => {
    const uid = "user-one";
    const email = "user-one@example.com";

    const db = testEnv
      .authenticatedContext(uid, { email })
      .firestore();

    await assertFails(
      setDoc(doc(db, "users", uid), {
        ...validUserProfile(uid, email),
        plan: "PREMIUM",
      })
    );
  });

  test("a user can read their own profile", async () => {
    const uid = "user-one";
    const email = "user-one@example.com";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users", uid),
        validUserProfile(uid, email)
      );
    });

    const db = testEnv
      .authenticatedContext(uid, { email })
      .firestore();

    await assertSucceeds(getDoc(doc(db, "users", uid)));
  });

  test("a user cannot read another user's profile", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users", "user-two"),
        validUserProfile(
          "user-two",
          "user-two@example.com"
        )
      );
    });

    const db = testEnv
      .authenticatedContext("user-one", {
        email: "user-one@example.com",
      })
      .firestore();

    await assertFails(
      getDoc(doc(db, "users", "user-two"))
    );
  });

  test("a user cannot update their own profile from the browser", async () => {
    const uid = "user-one";
    const email = "user-one@example.com";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users", uid),
        validUserProfile(uid, email)
      );
    });

    const db = testEnv
      .authenticatedContext(uid, { email })
      .firestore();

    await assertFails(
      updateDoc(doc(db, "users", uid), {
        name: "Changed Name",
      })
    );
  });

  test("a user can delete their own profile", async () => {
    const uid = "user-one";
    const email = "user-one@example.com";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users", uid),
        validUserProfile(uid, email)
      );
    });

    const db = testEnv
      .authenticatedContext(uid, { email })
      .firestore();

    await assertSucceeds(
      deleteDoc(doc(db, "users", uid))
    );
  });

  test("a user cannot delete another user's profile", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users", "user-two"),
        validUserProfile(
          "user-two",
          "user-two@example.com"
        )
      );
    });

    const db = testEnv
      .authenticatedContext("user-one", {
        email: "user-one@example.com",
      })
      .firestore();

    await assertFails(
      deleteDoc(doc(db, "users", "user-two"))
    );
  });
});