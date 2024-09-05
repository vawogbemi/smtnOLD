export function getPackageCount(formData: FormData) {
  return formData.get("method") === "air"
    ? parseInt(formData.get("number_of_boxes") as string)
    : parseInt(formData.get("small") as string) +
        parseInt(formData.get("large") as string);
}

export function getTotalWeight(formData: FormData) {
  return formData.get("method") === "air"
    ? parseInt(formData.get("total_weight") as string)
    : 0;
}

export function getSmallCount(formData: FormData) {
  return formData.get("method") === "ocean"
    ? parseInt(formData.get("small") as string)
    : 0;
}

export function getLargeCount(formData: FormData) {
  return formData.get("method") === "ocean"
    ? parseInt(formData.get("large") as string)
    : 0;
}
