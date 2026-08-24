export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
        resolve(reader.result);
        return;
      }

      reject(new Error('Please choose a valid image file.'));
    });
    reader.addEventListener('error', () => reject(new Error('Unable to read profile photo.')));
    reader.readAsDataURL(file);
  });
}
