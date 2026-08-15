import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    getAdminAuth,
  } from "../../../../lib/firebase-admin";
  
  import {
    getPaymentProviderService,
    processValidatedPurchase,
    type PaymentMethod,
    type PaymentProduct,
    type PaymentProvider,
  } from "../../../../lib/payments";
  
  type RequestBody = {
    provider?: PaymentProvider;
    paymentMethod?: PaymentMethod;
    product?: PaymentProduct;
    providerPurchaseId?: string;
  };
  
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
  
  function getSafeErrorName(
    error: unknown
  ): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      typeof (
        error as {
          name?: unknown;
        }
      ).name === "string"
    ) {
      return (
        error as {
          name: string;
        }
      ).name;
    }
  
    return "UnknownError";
  }
  
  export async function POST(
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
  
      const decodedToken =
        await getAdminAuth().verifyIdToken(
          idToken,
          true
        );
  
      const body =
        (await request.json()) as RequestBody;
  
      const {
        provider,
        paymentMethod,
        product,
        providerPurchaseId,
      } = body;
  
      if (
        !provider ||
        !paymentMethod ||
        !product ||
        !providerPurchaseId
      ) {
        return NextResponse.json(
          {
            error: "Invalid request.",
          },
          {
            status: 400,
          }
        );
      }
  
      const service =
        getPaymentProviderService(
          provider
        );
  
      const validation =
        await service.validatePurchase(
          decodedToken.uid,
          providerPurchaseId,
          product
        );
  
      if (!validation.valid) {
        return NextResponse.json(
          {
            error:
              validation.reason,
          },
          {
            status: 400,
          }
        );
      }
  
      if (
        validation.userId !==
        decodedToken.uid
      ) {
        return NextResponse.json(
          {
            error: "wrong-user",
          },
          {
            status: 403,
          }
        );
      }
  
      if (
        validation.provider !==
          provider ||
        validation.product !==
          product ||
        validation.providerPurchaseId !==
          providerPurchaseId
      ) {
        return NextResponse.json(
          {
            error:
              "invalid-purchase",
          },
          {
            status: 400,
          }
        );
      }
  
      const result =
        await processValidatedPurchase({
          userId:
            decodedToken.uid,
  
          provider,
  
          paymentMethod,
  
          providerPurchaseId,
  
          product,
        });
  
      return NextResponse.json(
        result
      );
    } catch (error) {
      console.error(
        "PAY validate payment error:",
        getSafeErrorName(error)
      );
  
      return NextResponse.json(
        {
          error:
            "Unable to validate payment.",
        },
        {
          status: 500,
        }
      );
    }
  }