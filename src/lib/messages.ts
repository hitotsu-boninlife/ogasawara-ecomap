import raw from "@/data/messages.json";

/** 全 UI テキストへの型付きアクセス */
export const m = raw;

/**
 * テンプレート文字列の変数を置換する。
 * 例: t("「{name}」に到着", { name: "曼荼羅COFFEE" }) → "「曼荼羅COFFEE」に到着"
 */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
