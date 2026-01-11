import { Color, PlayerData } from "../../types/stats";

type HFInferenceResponse = {
	username: string;
	color: Color;
	results: Array<{
		opening_name: string;
		opening_eco: string;
		opening_id: number;
		opening_recommendation_score: number;
	}>;
};

const sendRawStatsToHF = async (
	data: PlayerData
): Promise<HFInferenceResponse | { error: string }> => {
	// Step 1: Convert payload to JSON
	// Step 2: Send POST request to HF endpoint
	// Step 3: Parse response JSON
	// Step 4: Return parsed response

	return {} as unknown as HFInferenceResponse;
};

export default sendRawStatsToHF;
