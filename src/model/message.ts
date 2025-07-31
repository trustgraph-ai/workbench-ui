export interface Message {
  role: string;
  text: string;
  type?: "normal" | "thinking" | "observation" | "answer";
}
