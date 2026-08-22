import { randomUUID } from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ENTITLEMENTS,
} from "../../../../lib/entitlements";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../../../../lib/firebase-admin";

import {
  calculateHeatInput,
  PROCESS_EFFICIENCY,
  type WeldingProcess,
} from "../../../../lib/heat-input";

import {
  calculateCarbonEquivalent,
} from "../../../../lib/carbon-equivalent";

import {
  calculatePreheat,
} from "../../../../lib/preheat";

import {
  CET_RANGE,
  PREHEAT_RANGES,
} from "../../../../lib/preheat-validation";

import {
  consumePdfExportCreditServer,
} from "../../../../lib/payments";

import {
  generatePdfReport,
  type PdfReportImage,
  type PdfReportLogo,
  type PdfReportTheme,
} from "../../../../lib/reports/generatePdfReport";

import {
  reconcileDostPremiumAccess,
} from "../../../../lib/subscription-lifecycle";

export const runtime = "nodejs";

const MAX_LOGO_SIZE =
  3 * 1024 * 1024;

const MAX_REQUEST_SIZE =
  4 * 1024 * 1024;

const SUPPORTED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
] as const;

const MAX_REPORT_PHOTOS = 3;

const MAX_REPORT_PHOTO_SIZE =
  1024 * 1024;

const SUPPORTED_REPORT_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
] as const;

type SupportedLogoType =
  (typeof SUPPORTED_LOGO_TYPES)[number];

type SupportedReportPhotoType =
  (typeof SUPPORTED_REPORT_PHOTO_TYPES)[number];

type PdfAccess =
  | {
      mode: "premium";
      creditId: null;
    }
  | {
      mode: "credit";
      creditId: string;
    };

class ReportRequestError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);

    this.name =
      "ReportRequestError";

    this.status = status;
  }
}

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
    authorization
      .slice(7)
      .trim();

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

function readRequiredText(
  formData: FormData,
  key: string,
  maxLength: number
): string {
  const rawValue =
    formData.get(key);

  if (
    typeof rawValue !== "string"
  ) {
    throw new ReportRequestError(
      `${key} is required.`
    );
  }

  const value =
    rawValue.trim();

  if (!value) {
    throw new ReportRequestError(
      `${key} is required.`
    );
  }

  if (
    value.length > maxLength
  ) {
    throw new ReportRequestError(
      `${key} is too long.`
    );
  }

  return value;
}

function readOptionalText(
  formData: FormData,
  key: string,
  maxLength: number
): string | null {
  const rawValue =
    formData.get(key);

  if (rawValue === null) {
    return null;
  }

  if (
    typeof rawValue !== "string"
  ) {
    throw new ReportRequestError(
      `${key} is invalid.`
    );
  }

  const value =
    rawValue.trim();

  if (!value) {
    return null;
  }

  if (
    value.length > maxLength
  ) {
    throw new ReportRequestError(
      `${key} is too long.`
    );
  }

  return value;
}

function readBoolean(
  formData: FormData,
  key: string
): boolean {
  const value =
    readRequiredText(
      formData,
      key,
      5
    );

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new ReportRequestError(
    `${key} is invalid.`
  );
}

function readReportTheme(
  formData: FormData
): PdfReportTheme {
  const rawValue =
    formData.get(
      "reportTheme"
    );

  if (rawValue === null) {
    return "digital";
  }

  if (
    typeof rawValue !== "string"
  ) {
    throw new ReportRequestError(
      "reportTheme is invalid."
    );
  }

  const value =
    rawValue.trim();

  if (
    value === "digital" ||
    value === "print"
  ) {
    return value;
  }

  throw new ReportRequestError(
    "reportTheme is invalid."
  );
}

function readPositiveNumberText(
  formData: FormData,
  key: string
): string {
  const value =
    readRequiredText(
      formData,
      key,
      50
    );

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    throw new ReportRequestError(
      `${key} must be greater than 0.`
    );
  }

  return value;
}

function readNonNegativeNumberText(
  formData: FormData,
  key: string
): string {
  const value =
    readRequiredText(
      formData,
      key,
      50
    );

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    number > 100
  ) {
    throw new ReportRequestError(
      `${key} must be between 0 and 100.`
    );
  }

  return value;
}

function isWeldingProcess(
  value: string
): value is WeldingProcess {
  return Object.prototype.hasOwnProperty.call(
    PROCESS_EFFICIENCY,
    value
  );
}

function validateReportDate(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    throw new ReportRequestError(
      "Report date is invalid."
    );
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ReportRequestError(
      "Report date is invalid."
    );
  }

  return value;
}

async function readLogo(
  formData: FormData
): Promise<PdfReportLogo | null> {
  const value =
    formData.get("logo");

  if (value === null) {
    return null;
  }

  if (
    typeof value === "string"
  ) {
    if (!value.trim()) {
      return null;
    }

    throw new ReportRequestError(
      "Logo is invalid."
    );
  }

  if (value.size === 0) {
    return null;
  }

  if (
    value.size > MAX_LOGO_SIZE
  ) {
    throw new ReportRequestError(
      "Logo must be smaller than 3 MB.",
      413
    );
  }

  if (
    !SUPPORTED_LOGO_TYPES.includes(
      value.type as SupportedLogoType
    )
  ) {
    throw new ReportRequestError(
      "Logo must be a PNG, JPG or JPEG image."
    );
  }

  const bytes =
    new Uint8Array(
      await value.arrayBuffer()
    );

  return {
    bytes,

    mimeType:
      value.type as SupportedLogoType,
  };
}

function isPngBytes(
  bytes: Uint8Array
): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isJpegBytes(
  bytes: Uint8Array
): boolean {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

function hasMatchingImageSignature(
  bytes: Uint8Array,
  mimeType: SupportedReportPhotoType
): boolean {
  if (mimeType === "image/png") {
    return isPngBytes(bytes);
  }

  return isJpegBytes(bytes);
}

async function readReportPhotos(
  formData: FormData
): Promise<PdfReportImage[]> {
  const values =
    formData.getAll("photos");

  if (
    values.length >
    MAX_REPORT_PHOTOS
  ) {
    throw new ReportRequestError(
      `A maximum of ${MAX_REPORT_PHOTOS} report photos is allowed.`
    );
  }

  const photos: PdfReportImage[] =
    [];

  for (const value of values) {
    if (
      typeof value === "string"
    ) {
      throw new ReportRequestError(
        "Report photo is invalid."
      );
    }

    if (value.size === 0) {
      throw new ReportRequestError(
        "Report photo is empty."
      );
    }

    if (
      value.size >
      MAX_REPORT_PHOTO_SIZE
    ) {
      throw new ReportRequestError(
        "Each report photo must be smaller than 1 MB.",
        413
      );
    }

    if (
      !SUPPORTED_REPORT_PHOTO_TYPES.includes(
        value.type as SupportedReportPhotoType
      )
    ) {
      throw new ReportRequestError(
        "Report photos must be PNG, JPG or JPEG images."
      );
    }

    const mimeType =
      value.type as SupportedReportPhotoType;

    const bytes =
      new Uint8Array(
        await value.arrayBuffer()
      );

    if (
      !hasMatchingImageSignature(
        bytes,
        mimeType
      )
    ) {
      throw new ReportRequestError(
        "Report photo content does not match its image type."
      );
    }

    photos.push({
      bytes,
      mimeType,
    });
  }

  return photos;
}

async function resolvePdfAccess(
  userId: string
): Promise<PdfAccess | null> {
  const firestore =
    getAdminFirestore();

  /*
   * Reconcile a scheduled DOST Premium
   * cancellation before reading access.
   *
   * If the already-paid access period has
   * ended, Premium entitlements are removed
   * first. The PDF generator will then fall
   * back to a purchased PDF credit when one
   * is available, or deny export otherwise.
   *
   * Missing parent profiles remain safe:
   * the lifecycle helper is a no-op and the
   * existing subcollection credit lookup is
   * still allowed to continue.
   */
  await reconcileDostPremiumAccess(
    firestore,
    userId
  );

  const userReference =
    firestore
      .collection("users")
      .doc(userId);

  /*
   * A Firestore parent document
   * does not have to exist for
   * its subcollections to exist.
   *
   * Therefore we may not return
   * early when the user document
   * itself is missing.
   */
  const userSnapshot =
    await userReference.get();

  if (userSnapshot.exists) {
    const userData =
      userSnapshot.data();

    const entitlements =
      Array.isArray(
        userData?.entitlements
      )
        ? userData.entitlements.filter(
            (
              entitlement
            ): entitlement is string =>
              typeof entitlement ===
              "string"
          )
        : [];

    if (
      entitlements.includes(
        ENTITLEMENTS.PDF_EXPORT
      )
    ) {
      return {
        mode: "premium",
        creditId: null,
      };
    }
  }

  /*
   * Credits can still exist below
   * users/{uid}/pdf_export_credits
   * even when users/{uid} itself
   * does not exist.
   */
  const creditsSnapshot =
    await userReference
      .collection(
        "pdf_export_credits"
      )
      .where(
        "consumed",
        "==",
        false
      )
      .limit(1)
      .get();

  if (creditsSnapshot.empty) {
    return null;
  }

  return {
    mode: "credit",

    creditId:
      creditsSnapshot.docs[0].id,
  };
}

function createReportId(
  prefix:
    | "HI"
    | "CEQ"
    | "PRE"
): string {
  const randomPart =
    randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase();

  return `${prefix}-${randomPart}`;
}

function formatInputNumber(
  value: string
): string {
  const number =
    Number(value);

  return number.toString();
}

export async function POST(
  request: NextRequest
) {
  try {
    const contentLengthHeader =
      request.headers.get(
        "content-length"
      );

    if (contentLengthHeader) {
      const contentLength =
        Number(
          contentLengthHeader
        );

      if (
        Number.isFinite(
          contentLength
        ) &&
        contentLength >
          MAX_REQUEST_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "Report request is too large.",
          },
          {
            status: 413,
          }
        );
      }
    }

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
      await getAdminAuth()
        .verifyIdToken(
          idToken,
          true
        );

    const formData =
      await request.formData();

    const moduleId =
      readRequiredText(
        formData,
        "moduleId",
        100
      );

    let reportPrefix:
      | "HI"
      | "CEQ"
      | "PRE";

    let reportTitle: string;

    let calculationData: Array<{
      label: string;
      value: string;
      highlight?: boolean;
    }>;

    let formula: string;

    if (
      moduleId ===
        "heat-input"
    ) {
      const voltage =
        readPositiveNumberText(
          formData,
          "voltage"
        );

      const amperage =
        readPositiveNumberText(
          formData,
          "amperage"
        );

      const travelSpeed =
        readPositiveNumberText(
          formData,
          "travelSpeed"
        );

      const processValue =
        readRequiredText(
          formData,
          "process",
          50
        );

      if (
        !isWeldingProcess(
          processValue
        )
      ) {
        throw new ReportRequestError(
          "Welding process is invalid."
        );
      }

      const useFactor =
        readBoolean(
          formData,
          "useFactor"
        );

      const efficiency =
        PROCESS_EFFICIENCY[
          processValue
        ];

      const heatInput =
        calculateHeatInput(
          voltage,
          amperage,
          travelSpeed,
          efficiency,
          useFactor
        );

      if (heatInput === null) {
        throw new ReportRequestError(
          "The Heat Input calculation is invalid."
        );
      }

      reportPrefix = "HI";

      reportTitle =
        "Heat Input Calculation";

      calculationData = [
        {
          label: "Voltage",
          value:
            `${formatInputNumber(
              voltage
            )} V`,
        },
        {
          label: "Amperage",
          value:
            `${formatInputNumber(
              amperage
            )} A`,
        },
        {
          label:
            "Travel Speed",
          value:
            `${formatInputNumber(
              travelSpeed
            )} mm/min`,
        },
        {
          label: "Process",
          value:
            processValue,
        },
        {
          label: "K-Factor",
          value:
            useFactor
              ? efficiency.toFixed(
                  2
                )
              : "Not applied",
        },
        {
          label: "Heat Input",
          value:
            `${heatInput.toFixed(
              2
            )} kJ/mm`,
          highlight: true,
        },
      ];

      formula =
        useFactor
          ? "HI = (V x A x 60 x k) / (1000 x S)"
          : "HI = (V x A x 60) / (1000 x S)";
    } else if (
      moduleId ===
        "carbon-equivalent"
    ) {
      const carbon =
        readNonNegativeNumberText(
          formData,
          "carbon"
        );

      const manganese =
        readNonNegativeNumberText(
          formData,
          "manganese"
        );

      const chromium =
        readNonNegativeNumberText(
          formData,
          "chromium"
        );

      const molybdenum =
        readNonNegativeNumberText(
          formData,
          "molybdenum"
        );

      const vanadium =
        readNonNegativeNumberText(
          formData,
          "vanadium"
        );

      const nickel =
        readNonNegativeNumberText(
          formData,
          "nickel"
        );

      const copper =
        readNonNegativeNumberText(
          formData,
          "copper"
        );

      const carbonEquivalent =
        calculateCarbonEquivalent({
          carbon,
          manganese,
          chromium,
          molybdenum,
          vanadium,
          nickel,
          copper,
        });

      if (
        carbonEquivalent ===
        null
      ) {
        throw new ReportRequestError(
          "The Carbon Equivalent calculation is invalid."
        );
      }

      reportPrefix = "CEQ";

      reportTitle =
        "Carbon Equivalent Calculation";

      calculationData = [
        {
          label: "Carbon (C)",
          value:
            `${formatInputNumber(
              carbon
            )} %`,
        },
        {
          label:
            "Manganese (Mn)",
          value:
            `${formatInputNumber(
              manganese
            )} %`,
        },
        {
          label:
            "Chromium (Cr)",
          value:
            `${formatInputNumber(
              chromium
            )} %`,
        },
        {
          label:
            "Molybdenum (Mo)",
          value:
            `${formatInputNumber(
              molybdenum
            )} %`,
        },
        {
          label:
            "Vanadium (V)",
          value:
            `${formatInputNumber(
              vanadium
            )} %`,
        },
        {
          label: "Nickel (Ni)",
          value:
            `${formatInputNumber(
              nickel
            )} %`,
        },
        {
          label: "Copper (Cu)",
          value:
            `${formatInputNumber(
              copper
            )} %`,
        },
        {
          label:
            "Carbon Equivalent",
          value:
            carbonEquivalent.toFixed(
              3
            ),
          highlight: true,
        },
      ];

      formula =
        "CEq = C + Mn / 6 + (Cr + Mo + V) / 5 + (Ni + Cu) / 15";
    } else if (
      moduleId ===
        "preheat"
    ) {
      const carbon =
        readNonNegativeNumberText(
          formData,
          "carbon"
        );

      const manganese =
        readNonNegativeNumberText(
          formData,
          "manganese"
        );

      const molybdenum =
        readNonNegativeNumberText(
          formData,
          "molybdenum"
        );

      const chromium =
        readNonNegativeNumberText(
          formData,
          "chromium"
        );

      const copper =
        readNonNegativeNumberText(
          formData,
          "copper"
        );

      const nickel =
        readNonNegativeNumberText(
          formData,
          "nickel"
        );

      const thickness =
        readNonNegativeNumberText(
          formData,
          "thickness"
        );

      const hydrogen =
        readNonNegativeNumberText(
          formData,
          "hydrogen"
        );

      const heatInput =
        readNonNegativeNumberText(
          formData,
          "heatInput"
        );

      const numericInputs = {
        carbon:
          Number(carbon),
        manganese:
          Number(manganese),
        molybdenum:
          Number(molybdenum),
        chromium:
          Number(chromium),
        copper:
          Number(copper),
        nickel:
          Number(nickel),
        thickness:
          Number(thickness),
        hydrogen:
          Number(hydrogen),
        heatInput:
          Number(heatInput),
      };

      const rangeEntries = [
        [
          "carbon",
          numericInputs.carbon,
        ],
        [
          "manganese",
          numericInputs.manganese,
        ],
        [
          "molybdenum",
          numericInputs.molybdenum,
        ],
        [
          "chromium",
          numericInputs.chromium,
        ],
        [
          "copper",
          numericInputs.copper,
        ],
        [
          "nickel",
          numericInputs.nickel,
        ],
        [
          "thickness",
          numericInputs.thickness,
        ],
        [
          "hydrogen",
          numericInputs.hydrogen,
        ],
        [
          "heatInput",
          numericInputs.heatInput,
        ],
      ] as const;

      for (
        const [
          field,
          value,
        ] of rangeEntries
      ) {
        const range =
          PREHEAT_RANGES[
            field
          ];

        if (
          value < range.min ||
          value > range.max
        ) {
          throw new ReportRequestError(
            `${field} is outside the allowed range for this calculation method.`
          );
        }
      }

      const preheat =
        calculatePreheat({
          carbon,
          manganese,
          molybdenum,
          chromium,
          copper,
          nickel,
          thickness,
          hydrogen,
          heatInput,
        });

      if (!preheat) {
        throw new ReportRequestError(
          "The Preheat calculation is invalid."
        );
      }

      if (
        preheat.cet <
          CET_RANGE.min ||
        preheat.cet >
          CET_RANGE.max
      ) {
        throw new ReportRequestError(
          "Calculated CET is outside the allowed range for this calculation method."
        );
      }

      reportPrefix =
        "PRE";

      reportTitle =
        "Preheat Temperature Calculation";

      calculationData = [
        {
          label: "C / Mn",
          value:
            `${formatInputNumber(
              carbon
            )} / ${formatInputNumber(
              manganese
            )} %`,
        },
        {
          label: "Mo / Cr",
          value:
            `${formatInputNumber(
              molybdenum
            )} / ${formatInputNumber(
              chromium
            )} %`,
        },
        {
          label: "Cu / Ni",
          value:
            `${formatInputNumber(
              copper
            )} / ${formatInputNumber(
              nickel
            )} %`,
        },
        {
          label:
            "Plate Thickness",
          value:
            `${formatInputNumber(
              thickness
            )} mm`,
        },
        {
          label:
            "Hydrogen Content",
          value:
            `${formatInputNumber(
              hydrogen
            )} ml/100g`,
        },
        {
          label: "Heat Input",
          value:
            `${formatInputNumber(
              heatInput
            )} kJ/mm`,
        },
        {
          label: "CET",
          value:
            `${preheat.cet.toFixed(
              3
            )} %`,
        },
        {
          label:
            "Preheat Temperature",
          value:
            `${preheat.preheatTemperature.toFixed(
              0
            )} °C`,
          highlight: true,
        },
      ];

      formula =
        "Tp = 697 x CET + 160 x tanh(d / 35) + 62 x HD^0.35 + (53 x CET - 32) x Q - 328";
    } else {
      return NextResponse.json(
        {
          error:
            "Report module is not supported.",
        },
        {
          status: 400,
        }
      );
    }

    const projectName =
      readOptionalText(
        formData,
        "projectName",
        120
      );

    const projectNumber =
      readOptionalText(
        formData,
        "projectNumber",
        80
      );

    const reportDate =
      validateReportDate(
        readOptionalText(
          formData,
          "reportDate",
          10
        )
      );

    const standard =
      readOptionalText(
        formData,
        "standard",
        120
      );

    const reportTheme =
      readReportTheme(
        formData
      );

    const preparedBy =
      readOptionalText(
        formData,
        "preparedBy",
        120
      );

    const preparedByRole =
      readOptionalText(
        formData,
        "preparedByRole",
        120
      );

    const logo =
      await readLogo(
        formData
      );

    const photos =
      await readReportPhotos(
        formData
      );

    const access =
      await resolvePdfAccess(
        decodedToken.uid
      );

    if (!access) {
      return NextResponse.json(
        {
          error:
            "A PDF export credit or DOST Premium subscription is required.",

          code:
            "PDF_EXPORT_REQUIRED",
        },
        {
          status: 402,
        }
      );
    }

    const reportId =
      createReportId(
        reportPrefix
      );

    let pdfBytes: Uint8Array;

    try {
      pdfBytes =
        await generatePdfReport({
          reportId,

          reportTitle,

          projectName,

          projectNumber,

          reportDate,

          standard,

          preparedBy,

          preparedByRole,

          calculationData,

          formula,

          logo,

          photos,

          reportTheme,
        });
    } catch (error) {
      console.error(
        "REPORT PDF generation error:",
        getSafeErrorName(error)
      );

      return NextResponse.json(
        {
          error:
            "The PDF report could not be generated.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      access.mode === "credit"
    ) {
      const consumed =
        await consumePdfExportCreditServer(
          decodedToken.uid,
          access.creditId
        );

      if (!consumed) {
        return NextResponse.json(
          {
            error:
              "The PDF export credit is no longer available. Please try again.",

            code:
              "PDF_CREDIT_UNAVAILABLE",
          },
          {
            status: 409,
          }
        );
      }
    }

    const fileName =
      `DOST-${reportId}.pdf`;

    const responseBody =
      new Uint8Array(
        pdfBytes
      ).buffer;

    return new Response(
      responseBody,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Cache-Control":
            "private, no-store",

          "X-DOST-Report-ID":
            reportId,

          "X-DOST-Access-Mode":
            access.mode,
        },
      }
    );
  } catch (error) {
    if (
      error instanceof
      ReportRequestError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.status,
        }
      );
    }

    console.error(
      "REPORT generation route error:",
      getSafeErrorName(error)
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate PDF report.",
      },
      {
        status: 500,
      }
    );
  }
}
