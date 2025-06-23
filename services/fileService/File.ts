export class FileService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

  static async downloadFile(fileName: string): Promise<Blob> {
    const response = await fetch(
      `${this.API_BASE_URL}/File/storage?fileName=${encodeURIComponent(
        fileName
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao baixar arquivo");
    }

    return await response.blob();
  }
}
