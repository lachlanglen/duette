export const getAWSVideoUrl = key => {
  return `https://duette.s3.us-east-2.amazonaws.com/${key}.mov`;
};

export const getAWSThumbnailUrl = key => {
  return `https://duette.s3.us-east-2.amazonaws.com/${key}thumbnail.png`;
};
