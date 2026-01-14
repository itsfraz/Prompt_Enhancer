
export interface StyleDefinition {
  id: string;
  name: string;
  instruction: string;
  isCustom: boolean;
}

export interface EnhancementResult {
  original: string;
  enhanced: string;
  explanation: string;
  keyChanges: string[];
  tips: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  styleId: string;
  styleName: string;
  result: EnhancementResult;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}
