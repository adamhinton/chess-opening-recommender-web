// ________________________
// This util monitors memory usage when compiling a user's opening stats

// The problem:
// We're streaming many games on the client, 10_000 or more
// So ideally, our memory will be O(k), k being the number of openings (about 200-600) we track, rather than O(n), with n being the number of games (thousands or tens of thousands)

// The solution:
// We have written our stream to make sure that each game is garbage collected after parsing
// But I want to make sure we didn't bork it, since memory overusage would be a disaster. So we're writing this util to verify.
// ________________________
