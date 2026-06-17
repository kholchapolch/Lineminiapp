export type BadgeStatus = "earned" | "locked" | "no-badge";

export type BadgeType = "product" | "quest";

export type BadgeDisplayItem = {
  code: string;
  name: string;
  type: BadgeType;
  description: string | null;
  status: BadgeStatus;
  progress: number;
  remainingCount: number;
  matchedCount: number;
  requiredCount: number;
  imageUrl: string | null;
  serialNumber: string | null;
  modelName: string | null;
  registrationDate: string | null;
};

export type CustomerBadgeDisplay = {
  customerId: string;
  displayName: string;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
  supportMessage: string;
  badges: BadgeDisplayItem[];
};

export type BadgeDisplayRow = {
  customer_id: string;
  display_name: string;
  line_display_name: string | null;
  line_picture_url: string | null;
  support_message: string | null;
  badge_code: string;
  badge_name: string;
  badge_type: BadgeType;
  description: string | null;
  image_url: string | null;
  locked_image_url: string | null;
  required_count: number;
  matched_count: number | null;
  serial_number: string | null;
  model_name: string | null;
  registration_date: string | Date | null;
};
