const BLOCKED = new Set([
  // slurs
  'nigger', 'nigga', 'faggot', 'chink', 'spic', 'kike', 'gook', 'wetback',
  'tranny', 'dyke',
  // obvious profanity that wouldn't serve as a review
  'cunt', 'twat', 'wank', 'wanker',
]);

function isBlocked(word) {
  return BLOCKED.has(word.toLowerCase());
}

module.exports = { isBlocked };
