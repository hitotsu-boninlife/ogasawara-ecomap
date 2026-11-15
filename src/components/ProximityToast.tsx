import { useEffect, useRef } from "react";
import { spots } from "@/lib/event";
import { checkGps, type Pos } from "@/lib/validate";

type Props = {
  pos: Pos | null;
  collected: Set<string>;
  /** 範囲に入った瞬間に呼ばれる。スポット名を渡す */
  onNear: (spotName: string) => void;
};

/**
 * GPS 位置が未押印スポットの範囲に入った瞬間だけ onNear を発火する。
 * 同じスポットへの重複通知は suppression し、範囲を外れたら解除（再接近で再通知）。
 * 描画は行わない。
 */
export default function ProximityToast({ pos, collected, onNear }: Props) {
  // 「すでに通知済み」なスポットIDを保持（範囲内にいる間は再通知しない）
  const notified = useRef(new Set<string>());
  // refにすることで、collected/onNear 変化時に距離計算が不要に再実行されるのを防ぐ
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const onNearRef = useRef(onNear);
  onNearRef.current = onNear;

  useEffect(() => {
    if (!pos) return;

    spots.forEach((spot) => {
      // 押印済みはスキップ
      if (collectedRef.current.has(spot.id)) return;

      const result = checkGps(spot, pos);

      if (result.status === "ok") {
        // 範囲に入った「瞬間」（未通知のとき）だけ発火
        if (!notified.current.has(spot.id)) {
          notified.current.add(spot.id);
          onNearRef.current(spot.name);
        }
      } else {
        // 範囲を出たらリセット → 再接近時に再通知できる
        notified.current.delete(spot.id);
      }
    });
  }, [pos]);

  return null;
}
