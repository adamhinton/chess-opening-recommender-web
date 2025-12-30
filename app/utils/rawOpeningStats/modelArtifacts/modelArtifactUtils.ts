// While training my chess opening recommender AI model, I saved various artifacts to help with foldin inference.
// One was a list of openings we used in training.
// That list has been saved in this repo.
// When compiling raw opening stats, we will ignore openings that aren't in that list.

// This file will help with the following tasks:
// 1. Load the files with the list of openings
// 2. Save said openings to memory
//   probably a Set of opening names?

// Then, for each game streamed from the Lichess API, it will be compared against our list of training openings, and the game will be ignored if its opening isn't on the list.

// Note that there are other model artifacts, but I *think* the openings list is all we need in this repo. However, if we discover more we need, this file can also handle those.
