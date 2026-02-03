# Chess Opening Recommender

A personalized recommendation engine that analyzes a player's chess games and suggests opening sequences that fit their specific playing style and skill level.

## Table of Contents

- [The Innovation](#the-innovation)
- [For Non-Chess Players](#for-non-chess-players-the-spotify-analogy)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)

## The Innovation

Most chess tools suggest moves based on what supercomputers or Grandmasters play. This project takes a different approach: **Data-Driven Style Matching.**

I built a custom machine learning model trained on **1.1 billion** online chess games to understand how average, non-elite players handle specific positions. The system finds openings where players with your specific strengths and weaknesses have statistically outperformed the average.

- **1 Billion+ Games Analyzed:** Data pipeline processed a significant portion of the Lichess database.
- **50,000 Player Stylistic Profiles:** Analyzed the playing habits of the most active online players.
- **2,700 Distinct Openings:** Classifies and recommends from the full range of Encyclopedia of Chess Openings (ECO) codes.
- **Novel Architecture:** Unlike Stockfish (which calculates the objective "best" move), this use collaborative filtering techniques to find the "best fit" line.

## For Non-Chess Players (The "Spotify" Analogy)

Think of this like Spotify Discover Weekly, but for chess.

Standard chess engines are like listening to Top 40 radio—they tell you what is popular and objectively "good." This application is like a recommendation algorithm that notices you listen to a lot of 90s Grunge and suggests an obscure B-side track you've never heard but will almost certainly love. It looks at your "listening history" (your past games) to recommend new content (openings).

## Project Architecture

This project is split into three distinct repositories to separate concerns between Data Science, Inference, and the User Interface.

### 1. The Web Client (This Repository)

**Tech:** Next.js 15, TypeScript, Tailwind, Zod
The user interface. It handles fetching user games from the Lichess API, visualizing the recommendation tree, and managing user state. All game streaming happens client-side to keep the interface snappy.

Currently this is a frontend-only project that stores information in localStorage; Supabase backend integration is coming soon.

### 2. The Research Lab (Model Training)

**Link:** [github.com/adamhinton/chess-opening-recommender](https://github.com/adamhinton/chess-opening-recommender)
**Tech:** Python, Pandas, Scikit-learn, Jupyter
This is where the data science happened. Contains the notebooks for data cleaning, feature engineering, and the training pipeline that distilled billions of games into the model artifacts.

### 3. The Inference Engine (API)

**Link:** [github.com/adamhinton/chess-recommender-hf-space](https://github.com/adamhinton/chess-recommender-hf-space)
**Live Endpoint:** [huggingface.co/spaces/adamhinton/chess-opening-recommender](https://huggingface.co/spaces/adamhinton/chess-opening-recommender)
**Tech:** Python, Hugging Face Spaces
A lightweight Python API that hosts the pre-trained model. The Web Client sends a user's stats to this API, and it returns the recommended openings.

---

## Tech Stack

**Frontend**

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **State:** React Server Components + Client Hooks

**Backend & Data**

- **Database:** Currently localStorage, soon to be Supabase
- **Game Data:** Lichess API (NDJSON streaming)
- **Model Hosting:** Hugging Face Spaces (CPU Inference)

**Machine Learning**

- **Libraries:** Scikit-learn, Pandas, NumPy, PyTorch
- **Serialization:** Joblib

---

## Getting Started

### Prerequisites

You will need:

1.  Node.js 18+
2.  A [Hugging Face](https://huggingface.co) account (to host the inference model).

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/adamhinton/chess-opening-recommender-web.git
    cd chess-opening-recommender-web
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root directory and add the following keys.

    | Variable                                       | Description                                                             |
    | :--------------------------------------------- | :---------------------------------------------------------------------- |
    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Your Supabase public API key                                            |
    | `NEXT_PUBLIC_HF_SPACE_URL_DEV`                 | URL for local dev (likely localhost if running the python repo locally) |
    | `HF_SPACE_URL_PROD`                            | The full URL to your Hugging Face Space                                 |
    | `HF_API_TOKEN`                                 | Your Hugging Face Access Token                                          |

4.  Run the development server:
    ```bash
    npm run dev
    ```

### Setting up the AI Model (Forking the Project)

If you are running this project yourself, you need your own instance of the Inference API.

1.  Go to the [Hugging Face Space](https://huggingface.co/spaces/adamhinton/chess-opening-recommender).
2.  Click the three dots menu and select **"Duplicate this Space"**.
3.  This will create a copy of the API—_including the pre-trained model artifacts_—in your own account.
4.  Update the `HF_SPACE_URL_PROD` in your `.env.local` to point to your new URL.
