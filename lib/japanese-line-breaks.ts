const ZERO_WIDTH_SPACE = "\u200B"

const PUNCTUATION_BOUNDARY = /([、。！？!?：:；;／/｜|—–―])/g
const PARTICLE_BOUNDARY =
  /([\p{Script=Han}\p{Script=Katakana}A-Za-z0-9）)」』】](?:について|により|による|から|まで|より|など|への|との|を|が|は|に|で|と|へ|も|の))(?=[\p{Script=Han}\p{Script=Katakana}A-Za-z0-9（(「『【])/gu

/**
 * Adds invisible, phrase-level wrap opportunities for browsers that do not
 * support `word-break: auto-phrase`. The visible title remains unchanged.
 */
export function addJapanesePhraseBreaks(title: string): string {
  return title
    .replace(PUNCTUATION_BOUNDARY, `$1${ZERO_WIDTH_SPACE}`)
    .replace(PARTICLE_BOUNDARY, `$1${ZERO_WIDTH_SPACE}`)
}
