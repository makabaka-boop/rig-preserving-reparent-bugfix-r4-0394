import type { SkeletonDocument } from "./types";
import { canReparent, evaluatePose } from "./skeleton";
export function preserveReparent(
  doc: SkeletonDocument,
  id: string,
  parentId: string | null,
  time: number,
): SkeletonDocument {
  if (!canReparent(doc.bones, id, parentId) || !parentId)
    throw new Error("Invalid parent");
  const pose = evaluatePose(doc, time);
  const old = pose.find((b) => b.id === id)!,
    parent = pose.find((b) => b.id === parentId)!;
  doc.bones[id] = { ...doc.bones[id], parentId };
  const angle = old.worldAngle - parent.worldAngle;
  if (angle < doc.bones[id].minAngle || angle > doc.bones[id].maxAngle)
    throw new Error("Pose exceeds joint limits");
  doc.tracks[id] = (doc.tracks[id] ?? []).map((k) => ({
    ...k,
    angle: k.angle + old.localAngle - parent.worldAngle,
  }));
  return { ...doc, bones: { ...doc.bones, [id]: { ...doc.bones[id], angle } } };
}
