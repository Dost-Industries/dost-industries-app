import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

export type PdfReportField = {
  label: string;
  value: string;
  highlight?: boolean;
};

export type PdfReportImage = {
  bytes: Uint8Array;
  mimeType:
    | "image/png"
    | "image/jpeg";
};

export type PdfReportLogo =
  PdfReportImage;

export type PdfReportTheme =
  | "digital"
  | "print";

export type GeneratePdfReportInput = {
  reportId: string;

  reportTitle: string;

  projectName?: string | null;

  projectNumber?: string | null;

  reportDate?: string | null;

  standard?: string | null;

  preparedBy?: string | null;

  preparedByRole?: string | null;

  calculationData:
    PdfReportField[];

  formula?: string | null;

  logo?: PdfReportLogo | null;

  photos?: PdfReportImage[];

  reportTheme?: PdfReportTheme;

  generatedAt?: Date;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN = 24;
const CONTENT_WIDTH =
  PAGE_WIDTH - MARGIN * 2;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type PdfColor =
  ReturnType<typeof rgb>;

type ReportFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

type ReportTheme = {
  page: PdfColor;
  panel: PdfColor;
  panelAlt: PdfColor;
  panelSoft: PdfColor;
  accent: PdfColor;
  accentSoft: PdfColor;
  text: PdfColor;
  muted: PdfColor;
  faint: PdfColor;
  border: PdfColor;
  divider: PdfColor;
  signatureLine: PdfColor;
};

const DIGITAL_THEME: ReportTheme = {
  /*
   * Mirrors the current DOST app:
   * deep navy page, near-black technical
   * panels and a bright cyan HUD accent.
   */
  page: rgb(
    0,
    0,
    0
  ),
  panel: rgb(
    0.004,
    0.022,
    0.032
  ),
  panelAlt: rgb(
    0.008,
    0.035,
    0.045
  ),
  panelSoft: rgb(
    0.012,
    0.052,
    0.064
  ),
  accent: rgb(
    0,
    0.82,
    0.92
  ),
  accentSoft: rgb(
    0.32,
    0.92,
    0.97
  ),
  text: rgb(
    0.97,
    0.985,
    0.995
  ),
  muted: rgb(
    0.48,
    0.57,
    0.63
  ),
  faint: rgb(
    0.12,
    0.30,
    0.34
  ),
  border: rgb(
    0,
    0.48,
    0.56
  ),
  divider: rgb(
    0.07,
    0.22,
    0.26
  ),
  signatureLine: rgb(
    0.34,
    0.43,
    0.47
  ),
};

const PRINT_THEME: ReportTheme = {
  /*
   * Light/print follows the new Light UI:
   * white/off-white surfaces, dark navy
   * typography and the same cyan identity.
   */
  page: rgb(
    0.968,
    0.985,
    0.994
  ),
  panel: rgb(
    1,
    1,
    1
  ),
  panelAlt: rgb(
    0.982,
    0.993,
    0.997
  ),
  panelSoft: rgb(
    0.95,
    0.985,
    0.992
  ),
  accent: rgb(
    0,
    0.72,
    0.82
  ),
  accentSoft: rgb(
    0.16,
    0.82,
    0.9
  ),
  text: rgb(
    0.045,
    0.075,
    0.13
  ),
  muted: rgb(
    0.34,
    0.42,
    0.5
  ),
  faint: rgb(
    0.72,
    0.87,
    0.9
  ),
  border: rgb(
    0.42,
    0.82,
    0.87
  ),
  divider: rgb(
    0.78,
    0.91,
    0.93
  ),
  signatureLine: rgb(
    0.28,
    0.36,
    0.42
  ),
};

function getTheme(
  theme:
    | PdfReportTheme
    | undefined
): ReportTheme {
  return theme === "print"
    ? PRINT_THEME
    : DIGITAL_THEME;
}

function normalizeText(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFKC")
    .replace(/[–—]/g, "-")
    .replace(/×/g, "x")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
      ""
    )
    .trim();
}

function displayValue(
  value:
    | string
    | null
    | undefined
): string {
  const normalized =
    normalizeText(value);

  return normalized ||
    "Not provided";
}

function formatReportDate(
  value:
    | string
    | null
    | undefined
): string {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return "Not provided";
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      normalized
    );

  if (!match) {
    return normalized;
  }

  const year =
    Number(match[1]);

  const monthIndex =
    Number(match[2]) - 1;

  const day =
    Number(match[3]);

  if (
    !Number.isInteger(year) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31
  ) {
    return normalized;
  }

  return `${day} ${MONTHS[monthIndex]} ${year}`;
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const normalized =
    normalizeText(text);

  if (!normalized) {
    return [""];
  }

  const words =
    normalized.split(/\s+/);

  const lines: string[] = [];

  let currentLine = "";

  for (const word of words) {
    const candidate =
      currentLine
        ? `${currentLine} ${word}`
        : word;

    const candidateWidth =
      font.widthOfTextAtSize(
        candidate,
        fontSize
      );

    if (
      candidateWidth <= maxWidth
    ) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = "";
    }

    if (
      font.widthOfTextAtSize(
        word,
        fontSize
      ) <= maxWidth
    ) {
      currentLine = word;
      continue;
    }

    let fragment = "";

    for (const character of word) {
      const fragmentCandidate =
        fragment + character;

      if (
        font.widthOfTextAtSize(
          fragmentCandidate,
          fontSize
        ) <= maxWidth
      ) {
        fragment =
          fragmentCandidate;
        continue;
      }

      if (fragment) {
        lines.push(fragment);
      }

      fragment = character;
    }

    currentLine = fragment;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0
    ? lines
    : [""];
}

function drawPageBackground(
  page: PDFPage,
  theme: ReportTheme
) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: theme.page,
  });

  /*
   * Subtle technical grid copied from the
   * visual language of the calculator UI.
   * It remains deliberately faint so the
   * report still prints cleanly.
   */
  const gridStep = 28;

  for (
    let gridX = 18;
    gridX < PAGE_WIDTH;
    gridX += gridStep
  ) {
    page.drawLine({
      start: {
        x: gridX,
        y: 18,
      },
      end: {
        x: gridX,
        y: PAGE_HEIGHT - 18,
      },
      thickness: 0.25,
      color: theme.faint,
      opacity: 0.12,
    });
  }

  for (
    let gridY = 18;
    gridY < PAGE_HEIGHT;
    gridY += gridStep
  ) {
    page.drawLine({
      start: {
        x: 18,
        y: gridY,
      },
      end: {
        x: PAGE_WIDTH - 18,
        y: gridY,
      },
      thickness: 0.25,
      color: theme.faint,
      opacity: 0.12,
    });
  }

}

function drawArc(
  page: PDFPage,
  color: PdfColor,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  thickness: number
) {
  const segments = 8;

  let previous = {
    x:
      centerX +
      Math.cos(startAngle) *
        radius,
    y:
      centerY +
      Math.sin(startAngle) *
        radius,
  };

  for (
    let index = 1;
    index <= segments;
    index += 1
  ) {
    const progress =
      index / segments;

    const angle =
      startAngle +
      (
        endAngle -
        startAngle
      ) *
        progress;

    const next = {
      x:
        centerX +
        Math.cos(angle) *
          radius,
      y:
        centerY +
        Math.sin(angle) *
          radius,
    };

    page.drawLine({
      start: previous,
      end: next,
      thickness,
      color,
    });

    previous = next;
  }
}

function drawRoundedRectangle(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: PdfColor,
  borderColor: PdfColor,
  borderWidth = 0.7
) {
  const safeRadius =
    Math.max(
      0,
      Math.min(
        radius,
        width / 2,
        height / 2
      )
    );

  page.drawRectangle({
    x: x + safeRadius,
    y,
    width:
      width -
      safeRadius * 2,
    height,
    color: fillColor,
  });

  page.drawRectangle({
    x,
    y: y + safeRadius,
    width,
    height:
      height -
      safeRadius * 2,
    color: fillColor,
  });

  const corners = [
    {
      x: x + safeRadius,
      y: y + safeRadius,
    },
    {
      x:
        x +
        width -
        safeRadius,
      y: y + safeRadius,
    },
    {
      x:
        x +
        width -
        safeRadius,
      y:
        y +
        height -
        safeRadius,
    },
    {
      x: x + safeRadius,
      y:
        y +
        height -
        safeRadius,
    },
  ] as const;

  corners.forEach(
    (corner) => {
      page.drawCircle({
        x: corner.x,
        y: corner.y,
        size: safeRadius,
        color: fillColor,
      });
    }
  );

  page.drawLine({
    start: {
      x: x + safeRadius,
      y,
    },
    end: {
      x:
        x +
        width -
        safeRadius,
      y,
    },
    thickness: borderWidth,
    color: borderColor,
  });

  page.drawLine({
    start: {
      x: x + safeRadius,
      y: y + height,
    },
    end: {
      x:
        x +
        width -
        safeRadius,
      y: y + height,
    },
    thickness: borderWidth,
    color: borderColor,
  });

  page.drawLine({
    start: {
      x,
      y: y + safeRadius,
    },
    end: {
      x,
      y:
        y +
        height -
        safeRadius,
    },
    thickness: borderWidth,
    color: borderColor,
  });

  page.drawLine({
    start: {
      x: x + width,
      y: y + safeRadius,
    },
    end: {
      x: x + width,
      y:
        y +
        height -
        safeRadius,
    },
    thickness: borderWidth,
    color: borderColor,
  });

  drawArc(
    page,
    borderColor,
    x + safeRadius,
    y + safeRadius,
    safeRadius,
    Math.PI,
    Math.PI * 1.5,
    borderWidth
  );

  drawArc(
    page,
    borderColor,
    x +
      width -
      safeRadius,
    y + safeRadius,
    safeRadius,
    Math.PI * 1.5,
    Math.PI * 2,
    borderWidth
  );

  drawArc(
    page,
    borderColor,
    x +
      width -
      safeRadius,
    y +
      height -
      safeRadius,
    safeRadius,
    0,
    Math.PI / 2,
    borderWidth
  );

  drawArc(
    page,
    borderColor,
    x + safeRadius,
    y +
      height -
      safeRadius,
    safeRadius,
    Math.PI / 2,
    Math.PI,
    borderWidth
  );
}

type ReportIconKind =
  | "folder"
  | "shield"
  | "tag"
  | "user"
  | "calendar"
  | "briefcase"
  | "bolt"
  | "activity"
  | "gauge"
  | "flame"
  | "sliders"
  | "image"
  | "result";

function drawIconLine(
  page: PDFPage,
  theme: ReportTheme,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness = 0.9
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    color: theme.accent,
  });
}

function drawReportIcon(
  page: PDFPage,
  theme: ReportTheme,
  kind: ReportIconKind,
  centerX: number,
  centerY: number,
  size = 14
) {
  const half = size / 2;
  const left = centerX - half;
  const right = centerX + half;
  const bottom = centerY - half;
  const top = centerY + half;

  if (kind === "folder") {
    page.drawRectangle({
      x: left,
      y: bottom + 1,
      width: size,
      height: size * 0.68,
      borderColor: theme.accent,
      borderWidth: 0.9,
    });

    drawIconLine(page, theme, left + 1, top - 3, left + size * 0.38, top - 3);
    drawIconLine(
      page,
      theme,
      left + size * 0.38,
      top - 3,
      left + size * 0.48,
      top - 6
    );
    drawIconLine(
      page,
      theme,
      left + size * 0.48,
      top - 6,
      right - 1,
      top - 6
    );
    return;
  }

  if (kind === "shield") {
    const points = [
      { x: centerX, y: top },
      { x: right - 1, y: top - 3 },
      { x: right - 2, y: centerY - 2 },
      { x: centerX, y: bottom },
      { x: left + 2, y: centerY - 2 },
      { x: left + 1, y: top - 3 },
    ];

    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      drawIconLine(page, theme, point.x, point.y, next.x, next.y);
    });

    drawIconLine(
      page,
      theme,
      centerX - 3,
      centerY,
      centerX - 0.5,
      centerY - 2.5,
      1
    );
    drawIconLine(
      page,
      theme,
      centerX - 0.5,
      centerY - 2.5,
      centerX + 4,
      centerY + 3,
      1
    );
    return;
  }

  if (kind === "tag") {
    const points = [
      { x: left, y: centerY + 2 },
      { x: centerX - 1, y: top },
      { x: right, y: top - 1 },
      { x: right, y: centerY - 4 },
      { x: centerX - 2, y: bottom },
    ];

    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      drawIconLine(page, theme, point.x, point.y, next.x, next.y);
    });

    page.drawCircle({
      x: centerX + 3,
      y: centerY + 3,
      size: 1.5,
      borderColor: theme.accent,
      borderWidth: 0.8,
    });
    return;
  }

  if (kind === "user") {
    page.drawCircle({
      x: centerX,
      y: centerY + 4,
      size: size * 0.2,
      borderColor: theme.accent,
      borderWidth: 0.9,
    });

    drawIconLine(page, theme, centerX - 5, bottom + 1, centerX - 3, centerY - 2);
    drawIconLine(page, theme, centerX - 3, centerY - 2, centerX + 3, centerY - 2);
    drawIconLine(page, theme, centerX + 3, centerY - 2, centerX + 5, bottom + 1);
    drawIconLine(page, theme, centerX - 5, bottom + 1, centerX + 5, bottom + 1);
    return;
  }

  if (kind === "calendar") {
    page.drawRectangle({
      x: left + 1,
      y: bottom + 1,
      width: size - 2,
      height: size - 3,
      borderColor: theme.accent,
      borderWidth: 0.9,
    });

    drawIconLine(page, theme, left + 2, top - 5, right - 2, top - 5);
    drawIconLine(page, theme, centerX - 3, top, centerX - 3, top - 4);
    drawIconLine(page, theme, centerX + 3, top, centerX + 3, top - 4);

    page.drawCircle({
      x: centerX - 3,
      y: centerY - 1,
      size: 0.8,
      color: theme.accent,
    });
    page.drawCircle({
      x: centerX + 2,
      y: centerY - 1,
      size: 0.8,
      color: theme.accent,
    });
    return;
  }

  if (kind === "briefcase") {
    page.drawRectangle({
      x: left,
      y: bottom + 1,
      width: size,
      height: size * 0.68,
      borderColor: theme.accent,
      borderWidth: 0.9,
    });

    page.drawRectangle({
      x: centerX - 3,
      y: top - 4,
      width: 6,
      height: 4,
      borderColor: theme.accent,
      borderWidth: 0.8,
    });

    drawIconLine(page, theme, left, centerY, right, centerY);
    drawIconLine(page, theme, centerX, centerY + 1.5, centerX, centerY - 1.5, 1);
    return;
  }

  if (kind === "bolt") {
    const points = [
      { x: centerX + 1, y: top },
      { x: left + 2, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: bottom },
      { x: right - 2, y: centerY + 1 },
      { x: centerX + 1, y: centerY + 1 },
    ];

    for (let index = 0; index < points.length - 1; index += 1) {
      drawIconLine(
        page,
        theme,
        points[index].x,
        points[index].y,
        points[index + 1].x,
        points[index + 1].y,
        1.1
      );
    }
    return;
  }

  if (kind === "activity") {
    const points = [
      { x: left, y: centerY },
      { x: centerX - 4, y: centerY },
      { x: centerX - 2, y: top - 1 },
      { x: centerX + 1, y: bottom + 1 },
      { x: centerX + 3, y: centerY + 2 },
      { x: right, y: centerY + 2 },
    ];

    for (let index = 0; index < points.length - 1; index += 1) {
      drawIconLine(
        page,
        theme,
        points[index].x,
        points[index].y,
        points[index + 1].x,
        points[index + 1].y,
        1
      );
    }
    return;
  }

  if (kind === "gauge") {
    page.drawCircle({
      x: centerX,
      y: centerY,
      size: half - 1,
      borderColor: theme.accent,
      borderWidth: 0.8,
    });

    drawIconLine(page, theme, centerX, centerY, centerX + 4, centerY + 4, 1);

    page.drawCircle({
      x: centerX,
      y: centerY,
      size: 1.1,
      color: theme.accent,
    });
    return;
  }

  if (kind === "flame") {
    const points = [
      { x: centerX, y: top },
      { x: centerX - 1, y: centerY + 3 },
      { x: left + 2, y: centerY },
      { x: left + 3, y: bottom + 2 },
      { x: centerX, y: bottom },
      { x: right - 2, y: bottom + 3 },
      { x: right - 1, y: centerY + 2 },
      { x: centerX + 2, y: centerY + 5 },
    ];

    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      drawIconLine(page, theme, point.x, point.y, next.x, next.y, 0.9);
    });

    drawIconLine(page, theme, centerX, bottom + 2, centerX + 1, centerY + 2, 0.8);
    return;
  }

  if (kind === "image") {
    page.drawRectangle({
      x: left,
      y: bottom + 1,
      width: size,
      height: size - 2,
      borderColor:
        theme.accent,
      borderWidth: 0.85,
    });

    page.drawCircle({
      x: right - 3.5,
      y: top - 4,
      size: 1.2,
      borderColor:
        theme.accent,
      borderWidth: 0.75,
    });

    drawIconLine(
      page,
      theme,
      left + 2,
      bottom + 3,
      centerX - 1,
      centerY + 1,
      0.8
    );

    drawIconLine(
      page,
      theme,
      centerX - 1,
      centerY + 1,
      centerX + 2,
      centerY - 2,
      0.8
    );

    drawIconLine(
      page,
      theme,
      centerX + 2,
      centerY - 2,
      right - 2,
      bottom + 3,
      0.8
    );

    return;
  }

  if (kind === "sliders") {
    const offsets = [4, 0, -4];

    offsets.forEach((offset, index) => {
      drawIconLine(
        page,
        theme,
        left,
        centerY + offset,
        right,
        centerY + offset,
        0.8
      );

      page.drawCircle({
        x:
          index === 0
            ? centerX - 3
            : index === 1
              ? centerX + 3
              : centerX,
        y: centerY + offset,
        size: 1.5,
        color: theme.panel,
        borderColor: theme.accent,
        borderWidth: 0.8,
      });
    });
    return;
  }

  page.drawCircle({
    x: centerX,
    y: centerY,
    size: half - 1,
    borderColor:
      theme.accent,
    borderWidth: 0.9,
  });

  page.drawCircle({
    x: centerX,
    y: centerY,
    size: 1.2,
    color: theme.accent,
  });
}

function getMetadataIcon(
  label: string
): ReportIconKind {
  const normalized = normalizeText(label).toLowerCase();

  if (normalized.includes("project name")) return "folder";
  if (normalized.includes("standard")) return "shield";
  if (normalized.includes("project number")) return "tag";
  if (normalized.includes("prepared")) return "user";
  if (normalized.includes("date")) return "calendar";
  return "briefcase";
}

function getParameterIcon(
  label: string
): ReportIconKind {
  const normalized = normalizeText(label).toLowerCase();

  if (normalized.includes("voltage")) return "bolt";
  if (normalized.includes("amperage")) return "activity";
  if (normalized.includes("travel")) return "gauge";
  if (normalized.includes("process")) return "flame";
  if (
    normalized.includes("factor") ||
    normalized.includes("efficiency")
  ) {
    return "sliders";
  }

  return "result";
}

function drawCornerAccent(
  page: PDFPage,
  theme: ReportTheme,
  x: number,
  y: number,
  horizontalDirection:
    | 1
    | -1,
  verticalDirection:
    | 1
    | -1,
  size = 14
) {
  page.drawLine({
    start: {
      x,
      y,
    },
    end: {
      x:
        x +
        horizontalDirection *
          size,
      y,
    },
    thickness: 1.1,
    color: theme.accent,
  });

  page.drawLine({
    start: {
      x,
      y,
    },
    end: {
      x,
      y:
        y +
        verticalDirection *
          size,
    },
    thickness: 1.1,
    color: theme.accent,
  });
}

function drawPageFrame(
  page: PDFPage,
  theme: ReportTheme
) {
  const inset = 10;

  drawCornerAccent(
    page,
    theme,
    inset,
    PAGE_HEIGHT - inset,
    1,
    -1,
    24
  );

  drawCornerAccent(
    page,
    theme,
    PAGE_WIDTH - inset,
    PAGE_HEIGHT - inset,
    -1,
    -1,
    24
  );

  drawCornerAccent(
    page,
    theme,
    inset,
    inset,
    1,
    1,
    24
  );

  drawCornerAccent(
    page,
    theme,
    PAGE_WIDTH - inset,
    inset,
    -1,
    1,
    24
  );
}

function drawPanel(
  page: PDFPage,
  theme: ReportTheme,
  x: number,
  y: number,
  width: number,
  height: number,
  fill:
    | "panel"
    | "alternate"
    | "soft" =
    "panel"
) {
  const color =
    fill === "alternate"
      ? theme.panelAlt
      : fill === "soft"
        ? theme.panelSoft
        : theme.panel;

  drawRoundedRectangle(
    page,
    x,
    y,
    width,
    height,
    11,
    color,
    theme.border,
    0.75
  );

  page.drawLine({
    start: {
      x: x + 20,
      y: y + height - 2.5,
    },
    end: {
      x: x + 54,
      y: y + height - 2.5,
    },
    thickness: 0.45,
    color: theme.faint,
  });

  page.drawLine({
    start: {
      x: x + width - 54,
      y: y + 2.5,
    },
    end: {
      x: x + width - 20,
      y: y + 2.5,
    },
    thickness: 0.45,
    color: theme.faint,
  });
}

function drawLabel(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  text: string,
  x: number,
  y: number,
  size = 7
) {
  page.drawText(
    normalizeText(text)
      .toUpperCase(),
    {
      x,
      y,
      size,
      font: fonts.bold,
      color: theme.accent,
    }
  );
}

function drawMetadataCell(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const iconX = x + 20;
  const iconY = y + height / 2;
  const textX = x + 40;
  const labelY = y + height - 15;

  drawReportIcon(
    page,
    theme,
    getMetadataIcon(label),
    iconX,
    iconY,
    15
  );

  drawLabel(
    page,
    fonts,
    theme,
    label,
    textX,
    labelY,
    6.8
  );

  const lines =
    wrapText(
      displayValue(value),
      fonts.regular,
      10,
      width - 52
    ).slice(0, 2);

  lines.forEach(
    (
      line,
      index
    ) => {
      page.drawText(
        line,
        {
          x: textX,
          y:
            labelY -
            15 -
            index * 11,
          size: 10,
          font:
            fonts.regular,
          color:
            theme.text,
        }
      );
    }
  );
}
async function embedLogo(
  pdfDocument: PDFDocument,
  logo:
    | PdfReportLogo
    | null
    | undefined
): Promise<PDFImage | null> {
  if (!logo) {
    return null;
  }

  if (
    logo.mimeType ===
    "image/png"
  ) {
    return pdfDocument.embedPng(
      logo.bytes
    );
  }

  if (
    logo.mimeType ===
    "image/jpeg"
  ) {
    return pdfDocument.embedJpg(
      logo.bytes
    );
  }

  return null;
}

async function embedReportImages(
  pdfDocument: PDFDocument,
  images:
    | PdfReportImage[]
    | null
    | undefined
): Promise<PDFImage[]> {
  if (!images?.length) {
    return [];
  }

  const embeddedImages:
    PDFImage[] = [];

  for (
    const image of images.slice(
      0,
      3
    )
  ) {
    if (
      image.mimeType ===
      "image/png"
    ) {
      embeddedImages.push(
        await pdfDocument.embedPng(
          image.bytes
        )
      );

      continue;
    }

    if (
      image.mimeType ===
      "image/jpeg"
    ) {
      embeddedImages.push(
        await pdfDocument.embedJpg(
          image.bytes
        )
      );
    }
  }

  return embeddedImages;
}

function drawLogoArea(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  logo: PDFImage | null,
  x: number,
  y: number,
  width: number,
  height: number
) {
  if (logo) {
    const maxWidth =
      width - 28;

    const maxHeight =
      height - 28;

    const scale =
      Math.min(
        maxWidth /
          logo.width,
        maxHeight /
          logo.height,
        1
      );

    const logoWidth =
      logo.width * scale;

    const logoHeight =
      logo.height * scale;

    page.drawImage(
      logo,
      {
        x:
          x +
          (width -
            logoWidth) /
            2,
        y:
          y +
          (height -
            logoHeight) /
            2,
        width:
          logoWidth,
        height:
          logoHeight,
      }
    );

    return;
  }

  const markSize = 34;
  const markX =
    x +
    (width - markSize) /
      2;
  const markY =
    y +
    height -
    61;

  page.drawRectangle({
    x: markX,
    y: markY,
    width: markSize,
    height: markSize,
    borderColor:
      theme.accent,
    borderWidth: 1,
  });

  page.drawLine({
    start: {
      x: markX + 5,
      y:
        markY +
        markSize / 2,
    },
    end: {
      x:
        markX +
        markSize -
        5,
      y:
        markY +
        markSize / 2,
    },
    thickness: 0.8,
    color:
      theme.accent,
  });

  page.drawLine({
    start: {
      x:
        markX +
        markSize / 2,
      y: markY + 5,
    },
    end: {
      x:
        markX +
        markSize / 2,
      y:
        markY +
        markSize -
        5,
    },
    thickness: 0.8,
    color:
      theme.accent,
  });

  const logoText =
    "YOUR LOGO";

  const logoTextWidth =
    fonts.bold.widthOfTextAtSize(
      logoText,
      11
    );

  page.drawText(
    logoText,
    {
      x:
        x +
        (width -
          logoTextWidth) /
          2,
      y: y + 33,
      size: 11,
      font: fonts.bold,
      color:
        theme.text,
    }
  );

  const optionalText =
    "OPTIONAL";

  const optionalWidth =
    fonts.regular.widthOfTextAtSize(
      optionalText,
      6.5
    );

  page.drawText(
    optionalText,
    {
      x:
        x +
        (width -
          optionalWidth) /
          2,
      y: y + 20,
      size: 6.5,
      font:
        fonts.regular,
      color:
        theme.muted,
    }
  );
}

function drawTopInformation(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  input: GeneratePdfReportInput,
  logo: PDFImage | null
) {
  const x = MARGIN;
  const y = 692;
  const width =
    CONTENT_WIDTH;
  const height = 122;

  drawPanel(
    page,
    theme,
    x,
    y,
    width,
    height
  );

  const logoWidth = 128;
  const metadataX =
    x + logoWidth;

  const metadataWidth =
    width - logoWidth;

  const columnWidth =
    metadataWidth / 2;

  const rowHeight =
    height / 3;

  page.drawLine({
    start: {
      x: metadataX,
      y,
    },
    end: {
      x: metadataX,
      y: y + height,
    },
    thickness: 0.6,
    color: theme.divider,
  });

  page.drawLine({
    start: {
      x:
        metadataX +
        columnWidth,
      y,
    },
    end: {
      x:
        metadataX +
        columnWidth,
      y: y + height,
    },
    thickness: 0.6,
    color: theme.divider,
  });

  for (
    let row = 1;
    row <= 2;
    row += 1
  ) {
    const lineY =
      y +
      rowHeight * row;

    page.drawLine({
      start: {
        x: metadataX,
        y: lineY,
      },
      end: {
        x: x + width,
        y: lineY,
      },
      thickness: 0.6,
      color:
        theme.divider,
    });
  }

  drawLogoArea(
    page,
    fonts,
    theme,
    logo,
    x,
    y,
    logoWidth,
    height
  );

  const rows = [
    [
      {
        label:
          "Project Name",
        value:
          displayValue(
            input.projectName
          ),
      },
      {
        label:
          "Standard",
        value:
          displayValue(
            input.standard
          ),
      },
    ],
    [
      {
        label:
          "Project Number",
        value:
          displayValue(
            input.projectNumber
          ),
      },
      {
        label:
          "Prepared By",
        value:
          displayValue(
            input.preparedBy
          ),
      },
    ],
    [
      {
        label: "Date",
        value:
          formatReportDate(
            input.reportDate
          ),
      },
      {
        label: "Function",
        value:
          displayValue(
            input.preparedByRole
          ),
      },
    ],
  ] as const;

  rows.forEach(
    (
      row,
      rowIndex
    ) => {
      row.forEach(
        (
          cell,
          columnIndex
        ) => {
          const cellX =
            metadataX +
            columnIndex *
              columnWidth;

          const cellY =
            y +
            height -
            (rowIndex + 1) *
              rowHeight;

          drawMetadataCell(
            page,
            fonts,
            theme,
            cell.label,
            cell.value,
            cellX,
            cellY,
            columnWidth,
            rowHeight
          );
        }
      );
    }
  );
}

function getHighlightedItem(
  data: PdfReportField[]
): PdfReportField | null {
  return (
    data.find(
      (item) =>
        item.highlight === true
    ) ?? null
  );
}

function getInputItems(
  data: PdfReportField[]
): PdfReportField[] {
  const highlighted =
    getHighlightedItem(data);

  if (!highlighted) {
    return data;
  }

  let removed = false;

  return data.filter(
    (item) => {
      if (
        !removed &&
        item === highlighted
      ) {
        removed = true;
        return false;
      }

      return true;
    }
  );
}

function cleanSubjectLabel(
  value: string
): string {
  return normalizeText(value)
    .replace(
      /\b(result|calculation)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function buildReportHeading(
  input: GeneratePdfReportInput
): string {
  const highlighted =
    getHighlightedItem(
      input.calculationData
    );

  const subject =
    highlighted
      ? cleanSubjectLabel(
          highlighted.label
        )
      : cleanSubjectLabel(
          input.reportTitle
        );

  const normalized =
    normalizeText(subject);

  if (!normalized) {
    return "CALCULATION REPORT";
  }

  if (
    /\breport$/i.test(
      normalized
    )
  ) {
    return normalized.toUpperCase();
  }

  return `${normalized.toUpperCase()} REPORT`;
}

function buildResultHeading(
  item:
    | PdfReportField
    | null
): string {
  if (!item) {
    return "CALCULATION RESULT";
  }

  const label =
    cleanSubjectLabel(
      item.label
    );

  if (!label) {
    return "CALCULATION RESULT";
  }

  return `${label.toUpperCase()} RESULT`;
}

function drawTitleArea(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  input: GeneratePdfReportInput
) {
  const heading =
    buildReportHeading(input);

  const titleX = 30;
  const titleY = 642;

  const idWidth = 184;
  const idHeight = 58;
  const idX =
    PAGE_WIDTH -
    MARGIN -
    idWidth;
  const idY = 603;

  const titleRegionWidth =
    idX -
    titleX -
    18;

  const reportSuffix =
    " REPORT";

  const reportSuffixText =
    "REPORT";

  const reportSuffixGap = 12;

  const hasReportSuffix =
    heading.endsWith(
      reportSuffix
    );

  const subject =
    hasReportSuffix
      ? heading.slice(
          0,
          -reportSuffix.length
        )
      : heading;

  const suffix =
    hasReportSuffix
      ? reportSuffixText
      : "";

  const titleSize =
    heading.length > 24
      ? 13.5
      : 16.5;

  const subjectWidth =
    fonts.bold.widthOfTextAtSize(
      subject,
      titleSize
    );

  const suffixWidth =
    suffix
      ? fonts.bold.widthOfTextAtSize(
          suffix,
          titleSize
        )
      : 0;

  const headingWidth =
    subjectWidth +
    (suffix
      ? reportSuffixGap
      : 0) +
    suffixWidth;

  const headingX =
    titleX +
    (
      titleRegionWidth -
      headingWidth
    ) /
      2;

  const titleCenterY =
    titleY + 5;

  const lineGap = 10;
  const leftLineEnd =
    headingX -
    lineGap;

  const rightLineStart =
    headingX +
    headingWidth +
    lineGap;

  if (
    leftLineEnd >
    titleX + 8
  ) {
    page.drawLine({
      start: {
        x: titleX,
        y: titleCenterY,
      },
      end: {
        x: leftLineEnd,
        y: titleCenterY,
      },
      thickness: 0.75,
      color: theme.accent,
      opacity: 0.7,
    });
  }

  if (
    rightLineStart <
    titleX +
      titleRegionWidth -
      8
  ) {
    page.drawLine({
      start: {
        x: rightLineStart,
        y: titleCenterY,
      },
      end: {
        x:
          titleX +
          titleRegionWidth,
        y: titleCenterY,
      },
      thickness: 0.75,
      color: theme.accent,
      opacity: 0.7,
    });
  }

  page.drawText(
    subject,
    {
      x: headingX,
      y: titleY - 1,
      size: titleSize,
      font: fonts.bold,
      color: theme.text,
    }
  );

  if (suffix) {
    page.drawText(
      suffix,
      {
        x:
          headingX +
          subjectWidth +
          reportSuffixGap,
        y: titleY - 1,
        size: titleSize,
        font: fonts.bold,
        color: theme.accent,
      }
    );
  }

  const summary =
    "CALCULATION SUMMARY";

  const summarySize = 6.8;

  const summaryWidth =
    fonts.bold.widthOfTextAtSize(
      summary,
      summarySize
    );

  page.drawText(
    summary,
    {
      x:
        titleX +
        (
          titleRegionWidth -
          summaryWidth
        ) /
          2,
      y: titleY - 19,
      size: summarySize,
      font: fonts.bold,
      color: theme.muted,
    }
  );

  drawPanel(
    page,
    theme,
    idX,
    idY,
    idWidth,
    idHeight,
    "alternate"
  );

  drawReportIcon(
    page,
    theme,
    "result",
    idX + 18,
    idY + 42,
    12
  );

  drawLabel(
    page,
    fonts,
    theme,
    "Report ID",
    idX + 30,
    idY + 38,
    6.5
  );

  const reportId =
    normalizeText(
      input.reportId
    );

  const reportIdSize =
    reportId.length > 18
      ? 12
      : reportId.length > 13
        ? 15
        : 18;

  const reportIdWidth =
    fonts.bold.widthOfTextAtSize(
      reportId,
      reportIdSize
    );

  page.drawText(
    reportId,
    {
      x:
        idX +
        (
          idWidth -
          reportIdWidth
        ) /
          2,
      y: idY + 13,
      size: reportIdSize,
      font: fonts.bold,
      color: theme.text,
    }
  );
}

function splitResultValue(
  value: string
): {
  primary: string;
  unit: string;
} {
  const normalized =
    normalizeText(value);

  const match =
    /^([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))\s*(.*)$/.exec(
      normalized
    );

  if (!match) {
    return {
      primary:
        normalized ||
        "Not provided",
      unit: "",
    };
  }

  return {
    primary:
      match[1],
    unit:
      normalizeText(
        match[2]
      ),
  };
}

function drawInputTable(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  items: PdfReportField[],
  x: number,
  y: number,
  width: number,
  height: number
) {
  drawPanel(
    page,
    theme,
    x,
    y,
    width,
    height
  );

  const headerHeight = 34;

  drawReportIcon(
    page,
    theme,
    "sliders",
    x + 17,
    y + height - 17,
    12
  );

  drawLabel(
    page,
    fonts,
    theme,
    "Input Parameters",
    x + 30,
    y + height - 21,
    7.8
  );

  page.drawLine({
    start: {
      x,
      y: y + height - headerHeight,
    },
    end: {
      x: x + width,
      y: y + height - headerHeight,
    },
    thickness: 0.6,
    color: theme.divider,
  });

  const visibleItems =
    items.slice(0, 7);

  const rowHeight =
    (height - headerHeight) /
    Math.max(
      visibleItems.length,
      1
    );

  visibleItems.forEach(
    (
      item,
      index
    ) => {
      const rowTop =
        y +
        height -
        headerHeight -
        rowHeight * index;

      const rowBottom =
        rowTop - rowHeight;

      if (index % 2 === 1) {
        page.drawRectangle({
          x: x + 1,
          y: rowBottom + 0.5,
          width: width - 2,
          height: rowHeight - 1,
          color: theme.panelAlt,
        });
      }

      if (
        index <
        visibleItems.length - 1
      ) {
        page.drawLine({
          start: {
            x,
            y: rowBottom,
          },
          end: {
            x: x + width,
            y: rowBottom,
          },
          thickness: 0.45,
          color: theme.divider,
        });
      }

      const centerY =
        rowBottom +
        rowHeight / 2;

      drawReportIcon(
        page,
        theme,
        getParameterIcon(
          item.label
        ),
        x + 21,
        centerY,
        14
      );

      const labelLines =
        wrapText(
          displayValue(
            item.label
          ),
          fonts.regular,
          8.2,
          width * 0.48
        ).slice(0, 2);

      const valueLines =
        wrapText(
          displayValue(
            item.value
          ),
          fonts.bold,
          9.2,
          width * 0.30
        ).slice(0, 2);

      const labelBlockHeight =
        labelLines.length * 10;

      labelLines.forEach(
        (
          line,
          lineIndex
        ) => {
          page.drawText(
            line,
            {
              x: x + 42,
              y:
                centerY +
                labelBlockHeight / 2 -
                8 -
                lineIndex * 10,
              size: 8.2,
              font:
                fonts.regular,
              color:
                theme.text,
            }
          );
        }
      );

      const valueBlockHeight =
        valueLines.length * 11;

      valueLines.forEach(
        (
          line,
          lineIndex
        ) => {
          const lineWidth =
            fonts.bold.widthOfTextAtSize(
              line,
              9.2
            );

          page.drawText(
            line,
            {
              x:
                x +
                width -
                16 -
                lineWidth,
              y:
                centerY +
                valueBlockHeight / 2 -
                9 -
                lineIndex * 11,
              size: 9.2,
              font:
                fonts.bold,
              color:
                theme.text,
            }
          );
        }
      );
    }
  );
}
function drawResultPanel(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  item:
    | PdfReportField
    | null,
  formula:
    | string
    | null
    | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) {
  drawPanel(
    page,
    theme,
    x,
    y,
    width,
    height,
    "alternate"
  );

  const resultHeading =
    buildResultHeading(
      item
    );

  const resultHeadingSize =
    6.8;

  const resultHeadingWidth =
    fonts.bold.widthOfTextAtSize(
      resultHeading,
      resultHeadingSize
    );

  const resultHeadingX =
    x +
    (
      width -
      resultHeadingWidth
    ) /
      2;

  const resultHeadingY =
    y + height - 23;

  const resultLineY =
    resultHeadingY + 4;

  page.drawLine({
    start: {
      x: x + 18,
      y: resultLineY,
    },
    end: {
      x:
        Math.max(
          x + 18,
          resultHeadingX - 10
        ),
      y: resultLineY,
    },
    thickness: 0.6,
    color: theme.accent,
    opacity: 0.7,
  });

  page.drawText(
    resultHeading,
    {
      x: resultHeadingX,
      y: resultHeadingY,
      size: resultHeadingSize,
      font: fonts.bold,
      color: theme.accent,
    }
  );

  page.drawLine({
    start: {
      x:
        Math.min(
          x +
            width -
            18,
          resultHeadingX +
            resultHeadingWidth +
            10
        ),
      y: resultLineY,
    },
    end: {
      x:
        x +
        width -
        18,
      y: resultLineY,
    },
    thickness: 0.6,
    color: theme.accent,
    opacity: 0.7,
  });

  const resultCenterY =
    y +
    height /
      2 +
    20;

  const resultCardWidth =
    Math.min(
      width - 64,
      126
    );

  const resultCardHeight =
    92;

  drawRoundedRectangle(
    page,
    x +
      (
        width -
        resultCardWidth
      ) /
        2,
    resultCenterY -
      resultCardHeight / 2,
    resultCardWidth,
    resultCardHeight,
    16,
    theme.panel,
    theme.border,
    0.9
  );

  const result =
    splitResultValue(
      item
        ? displayValue(
            item.value
          )
        : "Not provided"
    );

  const maxPrimarySize =
    result.primary.length >
      10
      ? 22
      : result.primary.length >
          6
        ? 31
        : 42;

  const primaryWidth =
    fonts.bold.widthOfTextAtSize(
      result.primary,
      maxPrimarySize
    );

  page.drawText(
    result.primary,
    {
      x:
        x +
        (width -
          primaryWidth) /
          2,
      y:
        resultCenterY -
        9,
      size:
        maxPrimarySize,
      font: fonts.bold,
      color:
        theme.text,
    }
  );

  if (result.unit) {
    const unitSize = 13;

    const unitWidth =
      fonts.regular.widthOfTextAtSize(
        result.unit,
        unitSize
      );

    page.drawText(
      result.unit,
      {
        x:
          x +
          (width -
            unitWidth) /
            2,
        y:
          resultCenterY -
          31,
        size: unitSize,
        font:
          fonts.regular,
        color:
          theme.text,
      }
    );
  }

  const resultMarkerY =
    y + 61;

  page.drawLine({
    start: {
      x:
        x +
        width / 2 -
        40,
      y: resultMarkerY,
    },
    end: {
      x:
        x +
        width / 2 -
        8,
      y: resultMarkerY,
    },
    thickness: 0.45,
    color: theme.faint,
  });

  page.drawCircle({
    x: x + width / 2,
    y: resultMarkerY,
    size: 1.8,
    color: theme.accent,
  });

  page.drawLine({
    start: {
      x:
        x +
        width / 2 +
        8,
      y: resultMarkerY,
    },
    end: {
      x:
        x +
        width / 2 +
        40,
      y: resultMarkerY,
    },
    thickness: 0.45,
    color: theme.faint,
  });

  const formulaDividerY =
    y + 50;

  page.drawLine({
    start: {
      x: x + 16,
      y: formulaDividerY,
    },
    end: {
      x:
        x +
        width -
        16,
      y: formulaDividerY,
    },
    thickness: 0.6,
    color:
      theme.divider,
  });

  drawLabel(
    page,
    fonts,
    theme,
    "Formula Used",
    x + 16,
    y + 34,
    6.4
  );

  const normalizedFormula =
    normalizeText(formula);

  const formulaText =
    normalizedFormula ||
    "No formula supplied";

  const formulaSize =
    formulaText.startsWith(
      "Tp = 697 x CET"
    )
      ? 6.6
      : 7.2;

  const formulaLines =
    formulaText.startsWith(
      "Tp = 697 x CET"
    )
      ? [
          "Tp = 697 x CET + 160 x tanh(d / 35) + 62 x HD^0.35",
          "+ (53 x CET - 32) x Q - 328",
        ]
      : wrapText(
          formulaText,
          fonts.regular,
          formulaSize,
          width - 32
        ).slice(0, 2);

  formulaLines.forEach(
    (
      line,
      index
    ) => {
      page.drawText(
        line,
        {
          x: x + 16,
          y:
            y +
            18 -
            index *
              9,
          size: formulaSize,
          font:
            fonts.regular,
          color:
            normalizedFormula
              ? theme.text
              : theme.muted,
        }
      );
    }
  );
}

function drawPhotoPanel(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  photos: PDFImage[],
  x: number,
  y: number,
  width: number,
  height: number
) {
  drawPanel(
    page,
    theme,
    x,
    y,
    width,
    height
  );

  drawReportIcon(
    page,
    theme,
    "image",
    x + 18,
    y + height - 18,
    12
  );

  drawLabel(
    page,
    fonts,
    theme,
    "Report Photos",
    x + 31,
    y +
      height -
      22,
    7.5
  );

  const visiblePhotos =
    photos.slice(0, 3);

  if (
    visiblePhotos.length ===
    0
  ) {
    page.drawText(
      "No photos attached",
      {
        x: x + 16,
        y:
          y +
          height /
            2 -
          5,
        size: 8.5,
        font:
          fonts.regular,
        color:
          theme.muted,
      }
    );

    return;
  }

  const innerX =
    x + 14;

  const innerY =
    y + 12;

  const innerWidth =
    width - 28;

  const imageTop =
    y +
    height -
    34;

  const innerHeight =
    imageTop -
    innerY;

  const gap = 8;

  const slotWidth =
    (
      innerWidth -
      gap *
        (
          visiblePhotos.length -
          1
        )
    ) /
    visiblePhotos.length;

  visiblePhotos.forEach(
    (
      photo,
      index
    ) => {
      const slotX =
        innerX +
        index *
          (
            slotWidth +
            gap
          );

      page.drawRectangle({
        x: slotX,
        y: innerY,
        width:
          slotWidth,
        height:
          innerHeight,
        color:
          theme.panelAlt,
        borderColor:
          theme.border,
        borderWidth: 0.5,
      });

      const padding = 4;

      const availableWidth =
        slotWidth -
        padding * 2;

      const availableHeight =
        innerHeight -
        padding * 2;

      const scale =
        Math.min(
          availableWidth /
            photo.width,
          availableHeight /
            photo.height
        );

      const imageWidth =
        photo.width *
        scale;

      const imageHeight =
        photo.height *
        scale;

      page.drawImage(
        photo,
        {
          x:
            slotX +
            (
              slotWidth -
              imageWidth
            ) /
              2,
          y:
            innerY +
            (
              innerHeight -
              imageHeight
            ) /
              2,
          width:
            imageWidth,
          height:
            imageHeight,
        }
      );
    }
  );
}

function drawSignaturePanel(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  title: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  drawPanel(
    page,
    theme,
    x,
    y,
    width,
    height
  );

  drawReportIcon(
    page,
    theme,
    "result",
    x + width - 16,
    y +
      height -
      17,
    11
  );

  drawLabel(
    page,
    fonts,
    theme,
    title,
    x + 13,
    y +
      height -
      21,
    7
  );

  const labelX =
    x + 13;

  const lineStart =
    x + 48;

  const lineEnd =
    x +
    width -
    13;

  const fieldRows = [
    {
      label: "Name:",
      y:
        y +
        height -
        48,
    },
    {
      label:
        "Function:",
      y:
        y +
        height -
        68,
    },
    {
      label: "Date:",
      y:
        y +
        height -
        88,
    },
  ] as const;

  fieldRows.forEach(
    (field) => {
      page.drawText(
        field.label,
        {
          x: labelX,
          y: field.y,
          size: 6.8,
          font:
            fonts.regular,
          color:
            theme.text,
        }
      );

      page.drawLine({
        start: {
          x: lineStart,
          y:
            field.y - 1,
        },
        end: {
          x: lineEnd,
          y:
            field.y - 1,
        },
        thickness: 0.5,
        color:
          theme.signatureLine,
      });
    }
  );

  const signatureX =
    x + 13;

  const signatureY =
    y + 13;

  const signatureWidth =
    width - 26;

  const signatureHeight =
    Math.max(
      25,
      height - 113
    );

  page.drawRectangle({
    x: signatureX,
    y: signatureY,
    width:
      signatureWidth,
    height:
      signatureHeight,
    borderColor:
      theme.border,
    borderWidth: 0.5,
  });

  page.drawText(
    "Signature:",
    {
      x:
        signatureX +
        8,
      y:
        signatureY +
        signatureHeight -
        14,
      size: 6.8,
      font:
        fonts.regular,
      color:
        theme.text,
    }
  );

  drawCornerAccent(
    page,
    theme,
    signatureX +
      signatureWidth,
    signatureY,
    -1,
    1,
    7
  );
}

function drawSignatureRow(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme
) {
  const gap = 8;

  const width =
    (CONTENT_WIDTH -
      gap * 2) /
    3;

  const height = 146;
  const y = 69;

  drawSignaturePanel(
    page,
    fonts,
    theme,
    "Prepared By",
    MARGIN,
    y,
    width,
    height
  );

  drawSignaturePanel(
    page,
    fonts,
    theme,
    "Client",
    MARGIN +
      width +
      gap,
    y,
    width,
    height
  );

  drawSignaturePanel(
    page,
    fonts,
    theme,
    "External Quality Control",
    MARGIN +
      (width + gap) *
        2,
    y,
    width,
    height
  );
}

function drawFooter(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  pageNumber: number,
  totalPages: number
) {
  const footerY = 31;

  const dost =
    "DOST";

  page.drawText(
    dost,
    {
      x: MARGIN + 1,
      y: footerY,
      size: 8.2,
      font: fonts.bold,
      color:
        theme.text,
    }
  );

  const dostWidth =
    fonts.bold.widthOfTextAtSize(
      dost,
      8.7
    );

  page.drawText(
    " INDUSTRIES",
    {
      x:
        MARGIN +
        1 +
        dostWidth,
      y: footerY,
      size: 8.2,
      font: fonts.bold,
      color:
        theme.accent,
    }
  );

  page.drawText(
    "Digital Welding & Engineering Tools",
    {
      x: MARGIN + 1,
      y: footerY - 10,
      size: 5.7,
      font:
        fonts.regular,
      color:
        theme.muted,
    }
  );

  const pageText =
    `PAGE ${pageNumber} OF ${totalPages}`;

  const pageTextWidth =
    fonts.regular.widthOfTextAtSize(
      pageText,
      6.6
    );

  page.drawText(
    pageText,
    {
      x:
        PAGE_WIDTH -
        MARGIN -
        pageTextWidth,
      y: footerY - 1,
      size: 6.6,
      font:
        fonts.regular,
      color:
        theme.text,
    }
  );

  const lineStart =
    MARGIN + 166;

  const lineEnd =
    PAGE_WIDTH -
    MARGIN -
    pageTextWidth -
    22;

  if (
    lineEnd > lineStart
  ) {
    page.drawLine({
      start: {
        x: lineStart,
        y:
          footerY + 2,
      },
      end: {
        x: lineEnd,
        y:
          footerY + 2,
      },
      thickness: 0.6,
      color:
        theme.accent,
    });

    page.drawCircle({
      x: lineStart - 5,
      y: footerY + 2,
      size: 2,
      color: theme.accent,
    });

  }
}

function drawContinuationHeader(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  input: GeneratePdfReportInput
) {
  page.drawText(
    "DOST",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        42,
      size: 13,
      font: fonts.bold,
      color:
        theme.text,
    }
  );

  const dostWidth =
    fonts.bold.widthOfTextAtSize(
      "DOST",
      13
    );

  page.drawText(
    " INDUSTRIES",
    {
      x:
        MARGIN +
        dostWidth,
      y:
        PAGE_HEIGHT -
        42,
      size: 13,
      font: fonts.bold,
      color:
        theme.accent,
    }
  );

  const heading =
    buildReportHeading(
      input
    );

  const headingWidth =
    fonts.regular.widthOfTextAtSize(
      heading,
      7
    );

  page.drawText(
    heading,
    {
      x:
        PAGE_WIDTH -
        MARGIN -
        headingWidth,
      y:
        PAGE_HEIGHT -
        40,
      size: 7,
      font:
        fonts.regular,
      color:
        theme.muted,
    }
  );

  page.drawLine({
    start: {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        55,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y:
        PAGE_HEIGHT -
        55,
    },
    thickness: 0.7,
    color:
      theme.border,
  });
}

function drawContinuationTable(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  items: PdfReportField[]
) {
  const x = MARGIN;
  const top =
    PAGE_HEIGHT - 83;

  const headerHeight = 30;
  const rowHeight = 34;

  const maxRows =
    Math.min(
      items.length,
      18
    );

  const height =
    headerHeight +
    maxRows *
      rowHeight;

  const y =
    top - height;

  drawPanel(
    page,
    theme,
    x,
    y,
    CONTENT_WIDTH,
    height
  );

  drawLabel(
    page,
    fonts,
    theme,
    "Input Parameters - Continued",
    x + 14,
    top - 20,
    7.5
  );

  page.drawLine({
    start: {
      x,
      y:
        top -
        headerHeight,
    },
    end: {
      x:
        x +
        CONTENT_WIDTH,
      y:
        top -
        headerHeight,
    },
    thickness: 0.6,
    color:
      theme.divider,
  });

  items.slice(
    0,
    maxRows
  ).forEach(
    (
      item,
      index
    ) => {
      const rowTop =
        top -
        headerHeight -
        index *
          rowHeight;

      const rowBottom =
        rowTop -
        rowHeight;

      if (
        index % 2 === 1
      ) {
        page.drawRectangle({
          x: x + 1,
          y:
            rowBottom +
            0.5,
          width:
            CONTENT_WIDTH -
            2,
          height:
            rowHeight -
            1,
          color:
            theme.panelAlt,
        });
      }

      if (
        index <
        maxRows - 1
      ) {
        page.drawLine({
          start: {
            x,
            y:
              rowBottom,
          },
          end: {
            x:
              x +
              CONTENT_WIDTH,
            y:
              rowBottom,
          },
          thickness: 0.45,
          color:
            theme.divider,
        });
      }

      const label =
        displayValue(
          item.label
        );

      const value =
        displayValue(
          item.value
        );

      page.drawText(
        label,
        {
          x: x + 14,
          y:
            rowBottom +
            12,
          size: 8,
          font:
            fonts.regular,
          color:
            theme.text,
        }
      );

      const valueWidth =
        fonts.bold.widthOfTextAtSize(
          value,
          8
        );

      page.drawText(
        value,
        {
          x:
            x +
            CONTENT_WIDTH -
            14 -
            valueWidth,
          y:
            rowBottom +
            12,
          size: 8,
          font:
            fonts.bold,
          color:
            theme.text,
        }
      );
    }
  );
}

function drawMainReportPage(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  input: GeneratePdfReportInput,
  logo: PDFImage | null,
  photos: PDFImage[]
) {
  drawPageBackground(
    page,
    theme
  );

  drawPageFrame(
    page,
    theme
  );

  drawTopInformation(
    page,
    fonts,
    theme,
    input,
    logo
  );

  drawTitleArea(
    page,
    fonts,
    theme,
    input
  );

  const highlighted =
    getHighlightedItem(
      input.calculationData
    );

  const inputItems =
    getInputItems(
      input.calculationData
    );

  const mainY = 388;
  const mainHeight = 202;
  const gap = 12;

  const inputWidth = 282;
  const resultWidth =
    CONTENT_WIDTH -
    inputWidth -
    gap;

  drawInputTable(
    page,
    fonts,
    theme,
    inputItems,
    MARGIN,
    mainY,
    inputWidth,
    mainHeight
  );

  drawResultPanel(
    page,
    fonts,
    theme,
    highlighted,
    input.formula,
    MARGIN +
      inputWidth +
      gap,
    mainY,
    resultWidth,
    mainHeight
  );

  drawPhotoPanel(
    page,
    fonts,
    theme,
    photos,
    MARGIN,
    223,
    CONTENT_WIDTH,
    155
  );

  drawSignatureRow(
    page,
    fonts,
    theme
  );
}

export async function generatePdfReport(
  input: GeneratePdfReportInput
): Promise<Uint8Array> {
  const pdfDocument =
    await PDFDocument.create();

  const generatedAt =
    input.generatedAt ??
    new Date();

  const regular =
    await pdfDocument.embedFont(
      StandardFonts.Helvetica
    );

  const bold =
    await pdfDocument.embedFont(
      StandardFonts.HelveticaBold
    );

  const fonts: ReportFonts = {
    regular,
    bold,
  };

  const theme =
    getTheme(
      input.reportTheme
    );

  pdfDocument.setTitle(
    `${buildReportHeading(
      input
    )} - ${normalizeText(
      input.reportId
    )}`
  );

  pdfDocument.setAuthor(
    "DOST Industries"
  );

  pdfDocument.setCreator(
    "DOST Industries"
  );

  pdfDocument.setProducer(
    "DOST Report Engine"
  );

  pdfDocument.setSubject(
    buildReportHeading(
      input
    )
  );

  pdfDocument.setCreationDate(
    generatedAt
  );

  pdfDocument.setModificationDate(
    generatedAt
  );

  const embeddedLogo =
    await embedLogo(
      pdfDocument,
      input.logo
    );

  const embeddedPhotos =
    await embedReportImages(
      pdfDocument,
      input.photos
    );

  const pages: PDFPage[] = [];

  const mainPage =
    pdfDocument.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  pages.push(mainPage);

  drawMainReportPage(
    mainPage,
    fonts,
    theme,
    input,
    embeddedLogo,
    embeddedPhotos
  );

  const inputItems =
    getInputItems(
      input.calculationData
    );

  let remaining =
    inputItems.slice(7);

  while (
    remaining.length > 0
  ) {
    const page =
      pdfDocument.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    pages.push(page);

    drawPageBackground(
      page,
      theme
    );

    drawPageFrame(
      page,
      theme
    );

    drawContinuationHeader(
      page,
      fonts,
      theme,
      input
    );

    const pageItems =
      remaining.slice(
        0,
        18
      );

    drawContinuationTable(
      page,
      fonts,
      theme,
      pageItems
    );

    remaining =
      remaining.slice(
        pageItems.length
      );
  }

  for (
    let index = 0;
    index < pages.length;
    index += 1
  ) {
    drawFooter(
      pages[index],
      fonts,
      theme,
      index + 1,
      pages.length
    );
  }

  return pdfDocument.save();
}
