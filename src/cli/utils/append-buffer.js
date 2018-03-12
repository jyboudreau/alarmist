export default function appendBuffer(maxLength, original, extra) {
  if (extra.length >= maxLength) {
    return Buffer.from(extra.slice(extra.length - maxLength));
  } else {
    const newLength = original.length + extra.length;
    if (newLength <= maxLength) {
      return Buffer.concat([original, extra]);
    } else {
      return Buffer.concat([original.slice(newLength - maxLength), extra]);
    }
  }
}
