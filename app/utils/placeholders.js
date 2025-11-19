export const replacePlaceholders = (template, values) => {
  return Object.keys(values).reduce((temp, key) => temp.replace(new RegExp(`{{${key}}}`, 'g'), values[key]), template);
};

export const stripHtmlTags = (str) => {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
};
