import { Share } from "@capacitor/share";

export async function shareText(
  title: string,
  text: string,
  fileName?: string
) {
  await Share.share({
    title,
    text,
    dialogTitle: title,
  });
}
