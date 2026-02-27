export type KeywordDetector = {
  pattern: RegExp;
  message: string | ((agentName?: string) => string);
};

export interface KeywordDetectorState {
  detected: boolean;
  injected: boolean;
}
