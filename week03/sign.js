function isZero (zero) {
  if (1 / zero === Infinity) {
    return 1
  }
  if (1 / zero === -Infinity) {
    return -1
  }
} 

function sign(number) {
  return number / Math.abs(number)
}