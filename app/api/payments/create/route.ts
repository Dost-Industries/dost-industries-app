import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    getAdminAuth,
  } from "../../../../lib/firebase-admin";
  
  import {
    getPaymentProduct,
    getPaymentProviderService,
    validatePaymentRequest,
    type PaymentMethod,
    type PaymentProduct,
    type PaymentProvider,
  } from "../../../../lib/payments";
  
  type RequestBody = {
    provider?: PaymentProvider;
    paymentMethod?: PaymentMethod;
    product?: PaymentProduct;
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
      } = body;
  
      if (
        !provider ||
        !paymentMethod ||
        !product
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
  
      const productDefinition =
        getPaymentProduct(product);
  
      const validation =
        validatePaymentRequest({
          provider,
          paymentMethod,
          product,
          type:
            productDefinition.type,
        });
  
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
  
      const service =
        getPaymentProviderService(
          provider
        );
  
      const createdPayment =
        await service.createPayment({
          userId:
            decodedToken.uid,
  
          provider,
  
          paymentMethod,
  
          product,
        });
  
      return NextResponse.json({
        provider:
          createdPayment.provider,
  
        providerPurchaseId:
          createdPayment.providerPurchaseId,
  
        checkoutUrl:
          createdPayment.checkoutUrl,
      });
    } catch (error) {
      console.error(
        "PAY create payment error:",
        getSafeErrorName(error)
      );
  
      return NextResponse.json(
        {
          error:
            "Unable to create payment.",
        },
        {
          status: 500,
        }
      );
    }
  }