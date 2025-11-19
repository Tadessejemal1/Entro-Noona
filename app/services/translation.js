export const translateIcelandicChars = (str) => {
  // Check if the input is undefined or not a string
  if (typeof str !== 'string') {
    console.error('Expected a string but received:', str);
    return ''; // Or handle it in a way that makes sense for your application
  }

  const map = {
    'É': 'E',
    'Í': 'I',
    'Ó': 'O',
    'Ú': 'U',
    'Ý': 'Y',
    'Ð': 'D',
    'Þ': 'Th',
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'ý': 'y',
    'ð': 'd',
    'þ': 'th',
    'Æ': 'Ae',
    'æ': 'ae',
    'Ö': 'O',
    'ö': 'o'
  };

  // Replace Icelandic characters
  const translated = str.replace(/[ÉÍÓÚÝÐÞáéíóúýðþÆæÖö]/g, (char) => map[char] || char);

  // Return the original if no translation occurred, otherwise return the translated version
  return translated === str ? str : translated;
};
