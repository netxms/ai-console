/**
 * Escapes a value for safe inclusion in CSV output.
 * Prevents formula injection (=, +, -, @, tab, CR) and handles
 * proper quoting for values containing commas, quotes, or newlines.
 */
export function csvSafe(val) {
   let str = String(val ?? '')
   if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str
   }
   if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"'
   }
   return str
}
