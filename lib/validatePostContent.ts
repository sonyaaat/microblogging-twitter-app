export interface ValidatePostContentResult {
  valid: boolean;
  error?: string;
}

export function validatePostContent(content: unknown): ValidatePostContentResult {
  if (typeof content !== "string" || content.trim().length < 1) {
    return { valid: false, error: "Content must not be empty." };
  }
  if (content.length > 280) {
    return { valid: false, error: "Content must be 1–280 characters." };
  }
  return { valid: true };
}
