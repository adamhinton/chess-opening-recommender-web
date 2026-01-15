// ===============================
// This takes in a list of user's opening recommendations

// Displays them organized in a tree, by ECO letter, then by ECO number, then by opening name. Organized as a tree, with each section being collapsible
// If there isn't a recommendation for a letter/number/name, that section is omitted

// User isn't informed of confidence levels (maybe? TODO decide on this; leave room for it to be added later)

// Planning:

// State management:
// Not bothering with redux; when recommendations are generated, it'll save them to localStorage, then this page will read from localStorage to get the recommendations to display
// Will display a list of users etc if there's more than one recommendation saved

// TODO might componentize this further; we have SingleRecommendation.tsx for each individual recommendation; might want a component for each ECO letter section, and/or each ECO number subsection

// ===============================

const DisplayRecommendationsPage = () => {};

export default DisplayRecommendationsPage;
