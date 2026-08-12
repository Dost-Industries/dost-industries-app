import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    getAdminAuth,
    getAdminFirestore,
  } from "../../../../lib/firebase-admin";
  
  function getBearerToken(
    request: NextRequest
  ): string | null {
    const authorization =
      request.headers.get(
        "authorization"
      );
  
    if (
      !authorization?.startsWith(
        "Bearer "
      )
    ) {
      return null;
    }
  
    const token =
      authorization.slice(7).trim();
  
    return token || null;
  }
  
  export async function DELETE(
    request: NextRequest
  ) {
    try {
      const idToken =
        getBearerToken(request);
  
      if (!idToken) {
        return NextResponse.json(
          {
            error: "Unauthorized.",
          },
          {
            status: 401,
          }
        );
      }
  
      const auth = getAdminAuth();
  
      const decodedToken =
        await auth.verifyIdToken(
          idToken,
          true
        );
  
      const uid =
        decodedToken.uid;
  
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
  
      const db =
        getAdminFirestore();
  
      const userReference =
        db.collection("users").doc(uid);
  
      await db.recursiveDelete(
        userReference
      );
  
      await auth.deleteUser(uid);
  
      return NextResponse.json({
        success: true,
      });
    } catch (error) {
      console.error(
        "Account deletion failed:",
        error
      );
  
      return NextResponse.json(
        {
          error:
            "The account could not be deleted.",
        },
        {
          status: 500,
        }
      );
    }
  }