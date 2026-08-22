const REPORT_REQUEST_TARGET_BYTES =
  3_500_000;

const REPORT_PHOTO_MAX_BYTES =
  800 * 1024;

const REPORT_PHOTO_MIN_BYTES =
  180 * 1024;

const REPORT_PHOTO_MAX_DIMENSION =
  1600;

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(
            new Error(
              "REPORT_PHOTO_ENCODING_FAILED"
            )
          );
        },
        "image/jpeg",
        quality
      );
    }
  );
}

async function compressReportPhoto(
  file: File,
  targetBytes: number,
  index: number
): Promise<File> {
  if (file.size <= targetBytes) {
    return file;
  }

  const bitmap =
    await createImageBitmap(file);

  try {
    const initialScale =
      Math.min(
        1,
        REPORT_PHOTO_MAX_DIMENSION /
          Math.max(
            bitmap.width,
            bitmap.height
          )
      );

    let width =
      Math.max(
        1,
        Math.round(
          bitmap.width *
            initialScale
        )
      );

    let height =
      Math.max(
        1,
        Math.round(
          bitmap.height *
            initialScale
        )
      );

    let quality = 0.84;

    let bestBlob: Blob | null =
      null;

    for (
      let attempt = 0;
      attempt < 8;
      attempt += 1
    ) {
      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "REPORT_PHOTO_CANVAS_FAILED"
        );
      }

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        width,
        height
      );

      context.drawImage(
        bitmap,
        0,
        0,
        width,
        height
      );

      const blob =
        await canvasToJpegBlob(
          canvas,
          quality
        );

      bestBlob = blob;

      if (
        blob.size <= targetBytes
      ) {
        break;
      }

      if (quality > 0.58) {
        quality =
          Math.max(
            0.58,
            quality - 0.09
          );
      } else {
        width =
          Math.max(
            640,
            Math.round(
              width * 0.82
            )
          );

        height =
          Math.max(
            480,
            Math.round(
              height * 0.82
            )
          );

        quality = 0.68;
      }
    }

    if (!bestBlob) {
      throw new Error(
        "REPORT_PHOTO_ENCODING_FAILED"
      );
    }

    return new File(
      [bestBlob],
      `report-photo-${index + 1}.jpg`,
      {
        type: "image/jpeg",
        lastModified:
          file.lastModified,
      }
    );
  } finally {
    bitmap.close();
  }
}

export async function prepareReportPhotos(
  files: File[],
  logoSize: number
): Promise<File[]> {
  if (files.length === 0) {
    return [];
  }

  const availablePhotoBudget =
    Math.max(
      REPORT_PHOTO_MIN_BYTES *
        files.length,
      REPORT_REQUEST_TARGET_BYTES -
        Math.min(
          logoSize,
          3 * 1024 * 1024
        )
    );

  const targetPerPhoto =
    Math.max(
      REPORT_PHOTO_MIN_BYTES,
      Math.min(
        REPORT_PHOTO_MAX_BYTES,
        Math.floor(
          availablePhotoBudget /
            files.length
        )
      )
    );

  return Promise.all(
    files.map(
      (file, index) =>
        compressReportPhoto(
          file,
          targetPerPhoto,
          index
        )
    )
  );
}
