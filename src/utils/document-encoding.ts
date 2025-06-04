
/**
 * Converts a text string to Base64 encoding with proper UTF-8 handling
 * 
 * WHY THIS LOOKS WEIRD:
 * The btoa() function only works with ASCII characters (0-255), but JavaScript strings
 * can contain Unicode characters outside this range. This function uses a workaround:
 * 1. encodeURIComponent() converts Unicode to percent-encoded UTF-8 bytes (%XX format)
 * 2. replace() converts those %XX sequences back to actual bytes
 * 3. btoa() then safely encodes those bytes to Base64
 * 
 * @param {string} input - The text string to encode
 * @returns {string} Base64 encoded string
 */
export const textToBase64 = (input) => {
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode("0x" + p1);
    }),
  );
};

/**
 * Converts a File object to Base64 string (without data URL prefix)
 * 
 * WHY THIS LOOKS WEIRD:
 * FileReader.readAsDataURL() returns a data URL like "data:image/png;base64,iVBORw0KGgoA..."
 * but we only want the Base64 part. The regex removes the "data:" prefix and everything
 * up to the comma, leaving just the Base64 data.
 * 
 * ISSUES WITH CURRENT IMPLEMENTATION:
 * - Type assertion (as string) is unsafe - reader.result could be ArrayBuffer
 * - No error handling for failed file reads
 * - Regex is overly complex for simple string removal
 * 
 * @param {File} file - The file to convert to Base64
 * @returns {Promise<string>} Promise that resolves to Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      // FIXME: Type is 'string | ArrayBuffer'?  is this safe?
      // FIXME: Use Blob.arrayBuffer API?
      const data = (reader.result as string)
        .replace("data:", "")
        .replace(/^.+,/, "");

      resolve(data);
    };

    reader.readAsDataURL(file);
  });
};
