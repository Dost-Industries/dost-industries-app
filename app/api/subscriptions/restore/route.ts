import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    getAdminAuth,
  } from "../../../../lib/firebase-admin";
  
  async function getAuthenticatedUid(
    request: NextRequest
  ): Promise<string | null> {
    const authorization =
      request.headers.get("authorization");
  
    if (
      !authorization?.startsWith("Bearer ")
    ) {
      return null;
    }
  
    const idToken =
      authorization.slice(7).trim();
  
    if (!idToken) {
      return null;
    }
  
    const decodedToken =
      await getAdminAuth().verifyIdToken(
        idToken
      );
  
    return decodedToken.uid;
  }
  
  export async function POST(
    request: NextRequest
  ) {
    try {
      const uid =
        await getAuthenticatedUid(
          request
        );
  
      if (!uid) {
        return NextResponse.json(
          {
            error: "Unauthorized.",
          },
          {
            status: 401,
          }
        );
      }
  
      /*
       * MON-006:
       * authenticated restore endpoint.
       *
       * MON-007 will add the real purchase
       * provider/store validation.
       *
       * Until validation exists this endpoint
       * must never grant, remove or modify
       * subscription access.
       */
  
      return NextResponse.json({
        restored: false,
        subscription: null,
        message:
          "No validated purchase was found.",
      });
    } catch (error) {
      console.error(
        "MON-006 restore purchases error:",
        error
      );
  
      return NextResponse.json(
        {
          error:
            "Unable to restore purchases.",
        },
        {
          status: 500,
        }
      );
    }
  }