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

export type PdfReportLogo = {
  bytes: Uint8Array;
  mimeType:
    | "image/png"
    | "image/jpeg";
};

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
  page: rgb(
    0.008,
    0.024,
    0.036
  ),
  panel: rgb(
    0.012,
    0.044,
    0.06
  ),
  panelAlt: rgb(
    0.016,
    0.058,
    0.076
  ),
  panelSoft: rgb(
    0.02,
    0.072,
    0.09
  ),
  accent: rgb(
    0,
    0.82,
    0.92
  ),
  accentSoft: rgb(
    0.25,
    0.88,
    0.95
  ),
  text: rgb(
    0.94,
    0.97,
    0.98
  ),
  muted: rgb(
    0.57,
    0.64,
    0.68
  ),
  faint: rgb(
    0.27,
    0.36,
    0.4
  ),
  border: rgb(
    0,
    0.38,
    0.46
  ),
  divider: rgb(
    0.11,
    0.24,
    0.29
  ),
  signatureLine: rgb(
    0.38,
    0.46,
    0.5
  ),
};

const PRINT_THEME: ReportTheme = {
  page: rgb(
    1,
    1,
    1
  ),
  panel: rgb(
    1,
    1,
    1
  ),
  panelAlt: rgb(
    0.975,
    0.985,
    0.992
  ),
  panelSoft: rgb(
    0.955,
    0.975,
    0.988
  ),
  accent: rgb(
    0.015,
    0.42,
    0.78
  ),
  accentSoft: rgb(
    0.03,
    0.5,
    0.86
  ),
  text: rgb(
    0.045,
    0.055,
    0.07
  ),
  muted: rgb(
    0.31,
    0.34,
    0.38
  ),
  faint: rgb(
    0.68,
    0.72,
    0.75
  ),
  border: rgb(
    0.68,
    0.75,
    0.8
  ),
  divider: rgb(
    0.82,
    0.85,
    0.87
  ),
  signatureLine: rgb(
    0.32,
    0.34,
    0.36
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

  drawHexagonCluster(
    page,
    theme,
    PAGE_WIDTH - 118,
    PAGE_HEIGHT - 84,
    4,
    3,
    13
  );

  drawHexagonCluster(
    page,
    theme,
    PAGE_WIDTH - 96,
    112,
    3,
    2,
    11
  );
}

function getHexagonPoints(
  centerX: number,
  centerY: number,
  radius: number
) {
  return Array.from(
    {
      length: 6,
    },
    (_, index) => {
      const angle =
        Math.PI / 6 +
        (Math.PI / 3) * index;

      return {
        x:
          centerX +
          Math.cos(angle) *
            radius,
        y:
          centerY +
          Math.sin(angle) *
            radius,
      };
    }
  );
}

function drawHexagonOutline(
  page: PDFPage,
  color: PdfColor,
  centerX: number,
  centerY: number,
  radius: number,
  thickness = 0.7
) {
  const points =
    getHexagonPoints(
      centerX,
      centerY,
      radius
    );

  points.forEach(
    (point, index) => {
      const nextPoint =
        points[
          (index + 1) %
            points.length
        ];

      page.drawLine({
        start: point,
        end: nextPoint,
        thickness,
        color,
      });
    }
  );
}

function drawHexagonBadge(
  page: PDFPage,
  theme: ReportTheme,
  centerX: number,
  centerY: number,
  radius = 8
) {
  drawHexagonOutline(
    page,
    theme.accent,
    centerX,
    centerY,
    radius,
    0.8
  );

  page.drawLine({
    start: {
      x:
        centerX -
        radius * 0.35,
      y: centerY,
    },
    end: {
      x:
        centerX +
        radius * 0.35,
      y: centerY,
    },
    thickness: 0.7,
    color: theme.accent,
  });
}

function drawHexagonCluster(
  page: PDFPage,
  theme: ReportTheme,
  startX: number,
  startY: number,
  columns: number,
  rows: number,
  radius: number
) {
  const horizontalStep =
    Math.sqrt(3) * radius;

  const verticalStep =
    radius * 1.5;

  for (
    let row = 0;
    row < rows;
    row += 1
  ) {
    for (
      let column = 0;
      column < columns;
      column += 1
    ) {
      const centerX =
        startX +
        column *
          horizontalStep +
        (row % 2 === 1
          ? horizontalStep / 2
          : 0);

      const centerY =
        startY -
        row * verticalStep;

      drawHexagonOutline(
        page,
        theme.faint,
        centerX,
        centerY,
        radius,
        0.55
      );
    }
  }
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

  drawHexagonOutline(
    page,
    theme.accent,
    centerX,
    centerY,
    half - 1,
    0.9
  );

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

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
  });

  const cut = 9;
  const borderThickness = 0.7;

  page.drawLine({
    start: {
      x: x + cut,
      y: y + height,
    },
    end: {
      x: x + width - cut,
      y: y + height,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x: x + width - cut,
      y: y + height,
    },
    end: {
      x: x + width,
      y: y + height - cut,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x: x + width,
      y: y + height - cut,
    },
    end: {
      x: x + width,
      y: y + cut,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x: x + width,
      y: y + cut,
    },
    end: {
      x: x + width - cut,
      y,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x: x + width - cut,
      y,
    },
    end: {
      x: x + cut,
      y,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x: x + cut,
      y,
    },
    end: {
      x,
      y: y + cut,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x,
      y: y + cut,
    },
    end: {
      x,
      y: y + height - cut,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x,
      y: y + height - cut,
    },
    end: {
      x: x + cut,
      y: y + height,
    },
    thickness: borderThickness,
    color: theme.border,
  });

  page.drawLine({
    start: {
      x: x + 14,
      y: y + height - 2.5,
    },
    end: {
      x: x + 46,
      y: y + height - 2.5,
    },
    thickness: 0.55,
    color: theme.faint,
  });

  page.drawLine({
    start: {
      x: x + width - 46,
      y: y + 2.5,
    },
    end: {
      x: x + width - 14,
      y: y + 2.5,
    },
    thickness: 0.55,
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
  const y = 682;
  const width =
    CONTENT_WIDTH;
  const height = 132;

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

  drawHexagonOutline(
    page,
    theme.border,
    x + logoWidth / 2,
    y + height / 2 + 4,
    36,
    0.8
  );

  drawHexagonOutline(
    page,
    theme.faint,
    x + logoWidth / 2,
    y + height / 2 + 4,
    48,
    0.55
  );

  drawHexagonCluster(
    page,
    theme,
    x + 38,
    y + height - 26,
    2,
    2,
    8
  );

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
  const titleY = 636;

  page.drawText(
    heading,
    {
      x: titleX,
      y: titleY,
      size: 27,
      font: fonts.bold,
      color:
        theme.text,
    }
  );

  page.drawLine({
    start: {
      x: titleX,
      y: titleY + 8,
    },
    end: {
      x: titleX + 64,
      y: titleY + 8,
    },
    thickness: 0.75,
    color: theme.faint,
  });

  page.drawCircle({
    x: titleX + 69,
    y: titleY + 8,
    size: 1.6,
    color: theme.accent,
  });

  drawHexagonBadge(
    page,
    theme,
    titleX + 8,
    titleY - 18,
    7
  );

  page.drawText(
    "CALCULATION SUMMARY",
    {
      x: titleX + 18,
      y: titleY - 23,
      size: 9.5,
      font: fonts.bold,
      color:
        theme.accent,
    }
  );

  page.drawLine({
    start: {
      x: titleX + 18,
      y: titleY - 32,
    },
    end: {
      x: titleX + 92,
      y: titleY - 32,
    },
    thickness: 1.2,
    color: theme.accent,
  });

  const idWidth = 184;
  const idHeight = 58;
  const idX =
    PAGE_WIDTH -
    MARGIN -
    idWidth;
  const idY = 593;

  drawPanel(
    page,
    theme,
    idX,
    idY,
    idWidth,
    idHeight,
    "alternate"
  );

  drawHexagonBadge(
    page,
    theme,
    idX + 18,
    idY + 42,
    6
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
        (idWidth -
          reportIdWidth) /
          2,
      y: idY + 13,
      size:
        reportIdSize,
      font: fonts.bold,
      color:
        theme.text,
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

  drawHexagonBadge(
    page,
    theme,
    x + 17,
    y + height - 17,
    6
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
    items.slice(0, 6);

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

  drawReportIcon(
    page,
    theme,
    "result",
    x + 18,
    y + height - 18,
    12
  );

  drawLabel(
    page,
    fonts,
    theme,
    buildResultHeading(
      item
    ),
    x + 31,
    y +
      height -
      22,
    7.4
  );

  drawHexagonOutline(
    page,
    theme.border,
    x + width / 2,
    y + height / 2 + 4,
    Math.min(
      width,
      height
    ) * 0.32,
    1
  );

  drawHexagonOutline(
    page,
    theme.faint,
    x + width / 2,
    y + height / 2 + 4,
    Math.min(
      width,
      height
    ) * 0.36,
    0.55
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
      ? 24
      : result.primary.length >
          6
        ? 34
        : 46;

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
        y +
        height /
          2 -
        4,
      size:
        maxPrimarySize,
      font: fonts.bold,
      color:
        theme.text,
    }
  );

  if (result.unit) {
    const unitSize = 15;

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
          y +
          height /
            2 -
          29,
        size: unitSize,
        font:
          fonts.regular,
        color:
          theme.text,
      }
    );
  }

  page.drawLine({
    start: {
      x: x + 32,
      y: y + 32,
    },
    end: {
      x:
        x +
        width -
        32,
      y: y + 32,
    },
    thickness: 0.7,
    color:
      theme.accent,
  });
}

function parseFractionFormula(
  formula: string
): {
  left: string;
  numerator: string;
  denominator: string;
  suffix: string;
} | null {
  const normalized =
    normalizeText(formula);

  const match =
    /^(.+?)=\s*\((.+)\)\s*\/\s*\((.+)\)\s*(.*)$/i.exec(
      normalized
    );

  if (!match) {
    return null;
  }

  return {
    left:
      `${normalizeText(
        match[1]
      )}=`,
    numerator:
      normalizeText(
        match[2]
      ),
    denominator:
      normalizeText(
        match[3]
      ),
    suffix:
      normalizeText(
        match[4]
      ),
  };
}

function buildFormulaLegend(
  data: PdfReportField[]
): string[] {
  const legend: string[] = [];

  const hasLabel = (
    pattern: RegExp
  ) =>
    data.some(
      (item) =>
        pattern.test(
          normalizeText(
            item.label
          )
        )
    );

  if (
    hasLabel(/voltage/i)
  ) {
    legend.push(
      "V   =   Voltage (V)"
    );
  }

  if (
    hasLabel(/amperage/i)
  ) {
    legend.push(
      "A   =   Amperage (A)"
    );
  }

  if (
    hasLabel(
      /travel\s*speed/i
    )
  ) {
    legend.push(
      "S   =   Travel speed (mm/min)"
    );
  }

  if (
    hasLabel(
      /k[-\s]*factor|efficiency/i
    )
  ) {
    legend.push(
      "k   =   Efficiency (K-factor)"
    );
  }

  const highlighted =
    getHighlightedItem(data);

  if (
    highlighted &&
    /heat\s*input/i.test(
      highlighted.label
    )
  ) {
    legend.push(
      "HI  =   Heat input (kJ/mm)"
    );
  }

  return legend.slice(
    0,
    5
  );
}

function drawFormulaPanel(
  page: PDFPage,
  fonts: ReportFonts,
  theme: ReportTheme,
  formula:
    | string
    | null
    | undefined,
  data: PdfReportField[],
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
    "sliders",
    x + 18,
    y + height - 18,
    12
  );

  drawLabel(
    page,
    fonts,
    theme,
    "Formula Used",
    x + 31,
    y +
      height -
      22,
    7.5
  );

  drawHexagonCluster(
    page,
    theme,
    x + width - 72,
    y + height - 18,
    2,
    2,
    7
  );

  const normalizedFormula =
    normalizeText(formula);

  if (!normalizedFormula) {
    page.drawText(
      "No formula supplied",
      {
        x: x + 16,
        y:
          y +
          height /
            2 -
          4,
        size: 9,
        font:
          fonts.regular,
        color:
          theme.muted,
      }
    );

    return;
  }

  const legend =
    buildFormulaLegend(
      data
    );

  const formulaAreaWidth =
    legend.length > 0
      ? width * 0.56
      : width - 32;

  const parsed =
    parseFractionFormula(
      normalizedFormula
    );

  if (parsed) {
    const leftSize = 11;

    const leftWidth =
      fonts.regular.widthOfTextAtSize(
        parsed.left,
        leftSize
      );

    const numeratorWidth =
      fonts.regular.widthOfTextAtSize(
        parsed.numerator,
        10.5
      );

    const denominatorWidth =
      fonts.regular.widthOfTextAtSize(
        parsed.denominator,
        10.5
      );

    const fractionWidth =
      Math.max(
        numeratorWidth,
        denominatorWidth
      ) + 18;

    const totalWidth =
      leftWidth +
      8 +
      fractionWidth;

    const startX =
      x +
      16 +
      Math.max(
        0,
        (formulaAreaWidth -
          16 -
          totalWidth) /
          2
      );

    const centerY =
      y +
      height /
        2 -
      2;

    page.drawText(
      parsed.left,
      {
        x: startX,
        y:
          centerY - 4,
        size: leftSize,
        font:
          fonts.regular,
        color:
          theme.text,
      }
    );

    const fractionX =
      startX +
      leftWidth +
      8;

    const numeratorX =
      fractionX +
      (fractionWidth -
        numeratorWidth) /
        2;

    const denominatorX =
      fractionX +
      (fractionWidth -
        denominatorWidth) /
        2;

    page.drawText(
      parsed.numerator,
      {
        x: numeratorX,
        y:
          centerY + 10,
        size: 10.5,
        font:
          fonts.regular,
        color:
          theme.text,
      }
    );

    page.drawLine({
      start: {
        x: fractionX,
        y: centerY + 4,
      },
      end: {
        x:
          fractionX +
          fractionWidth,
        y: centerY + 4,
      },
      thickness: 0.8,
      color:
        theme.text,
    });

    page.drawText(
      parsed.denominator,
      {
        x: denominatorX,
        y:
          centerY - 13,
        size: 10.5,
        font:
          fonts.regular,
        color:
          theme.text,
      }
    );

    if (parsed.suffix) {
      page.drawText(
        parsed.suffix,
        {
          x:
            fractionX +
            fractionWidth +
            8,
          y:
            centerY - 4,
          size: 8,
          font:
            fonts.regular,
          color:
            theme.muted,
        }
      );
    }
  } else {
    const lines =
      wrapText(
        normalizedFormula,
        fonts.regular,
        9,
        formulaAreaWidth -
          32
      ).slice(0, 3);

    const totalHeight =
      lines.length *
      12;

    lines.forEach(
      (
        line,
        index
      ) => {
        const lineWidth =
          fonts.regular.widthOfTextAtSize(
            line,
            9
          );

        page.drawText(
          line,
          {
            x:
              x +
              16 +
              Math.max(
                0,
                (formulaAreaWidth -
                  32 -
                  lineWidth) /
                  2
              ),
            y:
              y +
              height /
                2 +
              totalHeight /
                2 -
              12 -
              index *
                12,
            size: 9,
            font:
              fonts.regular,
            color:
              theme.text,
          }
        );
      }
    );
  }

  if (
    legend.length > 0
  ) {
    const legendX =
      x +
      width * 0.6;

    const legendTop =
      y +
      height -
      31;

    legend.forEach(
      (
        line,
        index
      ) => {
        page.drawText(
          line,
          {
            x:
              legendX,
            y:
              legendTop -
              index * 11,
            size: 7.1,
            font:
              fonts.regular,
            color:
              theme.text,
          }
        );
      }
    );
  }
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

  drawHexagonBadge(
    page,
    theme,
    x + width - 16,
    y +
      height -
      17,
    5.5
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

  const height = 142;
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
      size: 8.7,
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
      size: 8.7,
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

    drawHexagonOutline(
      page,
      theme.faint,
      lineStart - 5,
      footerY + 2,
      5,
      0.45
    );
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

  drawHexagonCluster(
    page,
    theme,
    PAGE_WIDTH - 74,
    PAGE_HEIGHT - 30,
    2,
    2,
    6
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
  logo: PDFImage | null
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

  const mainY = 354;
  const mainHeight = 216;
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
    MARGIN +
      inputWidth +
      gap,
    mainY,
    resultWidth,
    mainHeight
  );

  drawFormulaPanel(
    page,
    fonts,
    theme,
    input.formula,
    input.calculationData,
    MARGIN,
    229,
    CONTENT_WIDTH,
    105
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
    embeddedLogo
  );

  const inputItems =
    getInputItems(
      input.calculationData
    );

  let remaining =
    inputItems.slice(6);

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
